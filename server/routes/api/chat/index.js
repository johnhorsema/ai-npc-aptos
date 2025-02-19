import express from "express";
import sqlite from "better-sqlite3";
import { format, toZonedTime } from "date-fns-tz";

import { model, dustyOpenAI } from "./openai.js";
import { FeatureExtractionPipeline } from "./embedding.js";
import { saveChat } from "./savechat.js";
import { saveContext } from "../context/index.js";
import { addTransaction } from "../../../ledger/index.js";
import { auth } from "../../../auth/index.js";
import { getBalance } from "../../../routes/api/credit/index.js";
import { VectorIndex } from "../../../vector/index.js";

import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../../data/dusty.db");
const db = new sqlite(dbPath, { verbose: console.log });
const THRESHOLD = 0.45;

const chat = express.Router();
let customSystemPrompt = [];

const dustyAvatarCompletion = async (assistantMessage) => {
  const avatarList = [
    "不好意思_有點可憐",
    "讚同_提供意見_稱讚",
    "思考中_有點不明",
    "一般狀態_微笑_說正面的說話",
    "教導_說一篇較長的話",
    "打開心窗_解難的鑰匙",
    "心痛_感受到對方的痛_哀傷",
    "平靜下來_鬆一口氣",
    "興奮_感到驚喜",
    "細心思考中_細心聆聽中",
    "慶賀_歡呼_恭喜",
    "氣憤_替人不值",
    "憤怒_憎恨",
    "擔憂_擔心_不安",
    "幸福_送上快樂_保護內心",
    "發怒_嬲_發瘋",
    "煩腦_想不通_頭暈",
    "抗拒_不喜歡",
    "快樂_喜歡_說得興奮",
    "問自己的心_對自己好_聽聽內心聲音",
    "被攻擊_感到痛苦_傷痕累累",
    "努力_奮鬥",
    "冷靜下來_靜靜地聽你說話",
    "有點不明白_發問",
    "關心地發問_擔心又不明情況",
    "害怕_不安_恐懼",
    "疲累_帶着樂觀面對艱難",
    "讓時間治療_傷會好的",
    "珍惜你的內心_你的心會對你誠實",
    "想到新的想法_有好提議",
    "為你加油",
    "好好動起來_練習",
    "休息吧_去睡了_發好夢",
    "努力工作_笑着努力學習",
    "希望_盼望",
    "扮傻瓜逗你笑",
    "擁抱",
    "安慰_感受到你的哀愁",
    "等了很久",
    "我會聆聽你的",
  ];
  let messages = [
    {
      role: "system",
      content:
        "請為以下文字配上情緒(0-39)。請輸出列表，例如5,14,2 或 4\n\n文字：" +
        assistantMessage +
        "\n\n情緒：" +
        avatarList.map((d, idx) => `${idx}. ${d}`).join("\n"),
    },
  ];

  const result = await dustyOpenAI.chat.completions.create({
    model: "gpt-35-turbo",
    messages: messages,
  });

  const content = result.choices[0]?.message?.content;
  return content.replace(/[^\d].*/, "");
};

const toArrayOrNumber = (str) => {
  // Check if the string starts with "[" and ends with "]"
  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      // Attempt to parse the string as a JSON array
      return JSON.parse(str);
    } catch (error) {
      console.error("Error parsing string as JSON array:", error);
    }
  } else {
    // Attempt to parse the string as an integer
    const number = parseInt(str);
    if (!isNaN(number)) {
      return number;
    }
  }

  // If the string cannot be converted to an array or an integer, return null
  return null;
};

export const getChatHistory = async () => {
  const query = db.prepare(
    `SELECT chat.session, user.username, chat.user, chat.content, chat.avatar, chat.created FROM chat INNER JOIN user ON chat.user_id = user.id ORDER BY chat.created DESC LIMIT 1000`,
  );
  const result = await query.all();
  return result
    .map((r) => {
      r.avatar = toArrayOrNumber(r.avatar);
      return r;
    })
    .reverse();
};

export const getChatHistoryMod = async (modId) => {
  const query = db.prepare(
    `SELECT chat.session, user.username, chat.user, chat.content, chat.avatar, chat.created FROM (SELECT * FROM chat WHERE user_id IN (SELECT user_id FROM user_permission WHERE moderator_id = @mod_id)) AS chat INNER JOIN user ON chat.user_id = user.id ORDER BY chat.created DESC LIMIT 1000`,
  );
  const result = await query.all({
    mod_id: modId,
  });
  return result
    .map((r) => {
      r.avatar = toArrayOrNumber(r.avatar);
      return r;
    })
    .reverse();
};

chat.post("/completion", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    throw new Error("No session info");
  }

  const user_id = session.user.userId;
  const role = session.user.role;

  let systemPrompt = await fs.readFile(
    path.resolve(__dirname, "../../../data/dusty.prompt.txt"),
    "utf8",
  );
  let emergencyContact = await fs.readFile(
    path.resolve(__dirname, "../../../data/dusty.emergencycontact.txt"),
    "utf8",
  );
  const { body } = req;
  const credit = await getBalance(session);

  if (body.log.filter((c) => c.role == "user").length > 18 && role == "user") {
    res.json({
      cause: {
        code: "Exceed usage limit",
      },
    });
  } else if ((role == "user" || role == "moderator") && credit.balance <= 0) {
    res.json({
      cause: {
        code: "Insufficient credits",
      },
    });
  } else {
    try {
      let clipIndexFile = await fs.readFile(
        path.resolve(
          __dirname,
          "../../../data/embedding/dustykid_clip_index.json",
        ),
        "utf8",
      );
      const clipIndex = JSON.parse(clipIndexFile);
      let bookMetadataFile = await fs.readFile(
        path.resolve(
          __dirname,
          "../../../data/embedding/dustykid_book_index.json",
        ),
        "utf8",
      );
      const bookMetadata = JSON.parse(bookMetadataFile);

      let index = {};
      index.clip = new VectorIndex(
        "cos",
        16,
        768,
        path.resolve(
          __dirname,
          "../../../data/embedding/dustykid_clip_meaning_001-239.usearch",
        ),
      );
      index.clipq = new VectorIndex(
        "cos",
        16,
        768,
        path.resolve(
          __dirname,
          "../../../data/embedding/dustykid_clip_question_001-239.usearch",
        ),
        clipIndex,
      );
      index.book = new VectorIndex(
        "cos",
        16,
        768,
        path.resolve(
          __dirname,
          "../../../data/embedding/dustykid_book.usearch",
        ),
        null,
        bookMetadata,
      );
      index.warning = new VectorIndex(
        "cos",
        16,
        768,
        path.resolve(
          __dirname,
          "../../../data/embedding/dustykid_warning.usearch",
        ),
      );

      const classifier = await FeatureExtractionPipeline.getInstance();
      let chunk = body.query.split(" ");
      if (chunk[0] === "/image" && role === "moderator") {
        let queryVector = await classifier("query: " + chunk[1], {
          pooling: "mean",
          normalize: true,
        });
        let results = {};
        results.gpt = "";
        let clipq = index.clipq
          .search(queryVector.data, 3)
          .filter((r) => r.score > THRESHOLD + 0.02);

        if (clipq.length == 0) {
          results.clip = index.clip
            .search(queryVector.data, chunk[2] ? parseInt(chunk[2]) : 1)
            .map((e) =>
              Object.assign(e, {
                image: `/assets/dusty/clip/${e.index}.png`,
              }),
            );
        } else {
          results.clip = clipq.map((e) =>
            Object.assign(e, {
              image: `/assets/dusty/clip/${clipIndex[e.index]}.png`,
            }),
          );
        }
        res.json(results);
      } else if (chunk[0] === "/prompt" && role === "tester") {
        let results = {};
        results.gpt = "";
        results.system = "SYSTEM_PROMPT:" + systemPrompt;
        res.json(results);
      } else if (chunk[0] === "/custom" && role === "tester") {
        let results = {};
        customSystemPrompt[body.session] = chunk[1];
        results.gpt = "";
        results.system = "CUSTOM_PROMPT_APPLIED: " + chunk[1];
        res.json(results);
      } else {
        let queryVector = await classifier("query: " + body.query, {
          pooling: "mean",
          normalize: true,
        });
        let results = {
          clip: [],
          book: [],
          gpt: null,
        };

        // Check warning
        let warning = index.warning.search(queryVector.data, 3);
        if (warning.filter((w) => w.score > 0.96).length > 0) {
          await saveChat(body.query, "user", user_id, body.session, 0, 0);
          await saveChat(
            `🚨 ${emergencyContact}`,
            "system",
            user_id,
            body.session,
            0,
            JSON.stringify([13]),
          );

          results.clip.push({
            image: `/assets/dusty/standard/warning.png`,
          });
          results.avatar = [13];
          results.gpt = `🚨<s>${emergencyContact}`;
        } else {
          // Provide system prompt
          let messages = [
            {
              role: "system",
              content: systemPrompt,
            },
          ];

          messages = messages.concat(
            body.log?.map((m) => ({
              role: m.role,
              content: m.content,
            })) ?? [],
          );

          // Set custom prompt if available
          if (customSystemPrompt[body.session]) {
            messages[0].content = customSystemPrompt[body.session];
            if (messages.length > 1) {
              messages = messages.slice(2);
            }
          }

          let clip = index.clip.search(queryVector.data, 3);
          let book = index.book.search(queryVector.data, 3);

          let clipq = index.clipq
            .search(queryVector.data, 3)
            .filter((r) => r.score > THRESHOLD + 0.02);
          if (clipq.length == 0) {
            results.clip = clip
              .filter((e) => e.score > THRESHOLD)
              .map((e) =>
                Object.assign(e, {
                  image: `/assets/dusty/clip/${e.index}.png`,
                }),
              );
          } else {
            results.clip = clipq.map((e) =>
              Object.assign(e, {
                image: `/assets/dusty/clip/${clipIndex[e.index]}.png`,
              }),
            );
          }

          console.log(book);
          results.book = book.filter((e) => e.score > THRESHOLD);

          if (results.clip.length > 0 || results.book.length > 0) {
            const ragInstruction = `\n3. 根據提供的文本回答，並以[數字]標明出處。如果內容超出了文本，避免回答。文本：\n${results.book
              .map((c) => {
                return c.text;
              })
              .map((d, i) => `[${i + 1}] ${d}`)
              .join("\n")}`;
            console.log(ragInstruction);
            // Provide context to the system message
            messages[0].content = messages[0].content + ragInstruction;
          }

          const response = await dustyOpenAI.chat.completions.create({
            model: model.dusty,
            messages: messages,
            temperature: 0.8,
          });

          let originalContent = "";
          let content = "";
          originalContent = response.choices[0]?.message?.content;
          content = response.choices[0]?.message?.content;
          console.log(originalContent);

          // Replace all paragraph with <s>
          content = content.replace(/\n\n/g, "<s>");
          // Replace all citations with <s>
          content = content.replace(/\[(\d+)\]/g, "<s>");
          // Replace all <text> with <s>
          content = content.replace(/<([^>]+)>/g, "<s>");

          // Image recommendation mode
          if (results.clip.length == 0 && body.image_mode == 0) {
            let responseVector = await classifier("query: " + content, {
              pooling: "mean",
              normalize: true,
            });
            clip = index.clip.search(responseVector.data, 3);
            results.clip = clip
              .filter((e) => e.score > THRESHOLD)
              .map((e) =>
                Object.assign(e, {
                  image: `/assets/dusty/clip/${e.index}.png`,
                }),
              );
          }

          // Emergency Contact Injection
          if (content.indexOf("🚨") !== -1) {
            content += `<s>${emergencyContact}`;
          }

          const avatar = await dustyAvatarCompletion(content);
          results.avatar = avatar.split(",");

          await saveChat(body.query, "user", user_id, body.session, 0, 0);
          await saveChat(
            content,
            "system",
            user_id,
            body.session,
            0,
            JSON.stringify(avatar.split(",")),
          );
          if (results.clip.length > 0 || results.book.length > 0) {
            await saveChat(
              JSON.stringify({
                clip: results.clip,
                book: results.book,
              }),
              "context",
              user_id,
              body.session,
              0,
              0,
            );
            await saveContext(
              [].concat(
                results.clip.map((i) => {
                  return {
                    doc_id: "clip_" + i.index,
                    session: body.session,
                    score: i.score,
                  };
                }),
                results.book
                  .filter((b, bidx) => {
                    return originalContent.match(`[${bidx + 1}]`);
                  })
                  .map((i) => {
                    return {
                      doc_id: "book_" + i.index,
                      session: body.session,
                      score: i.score,
                    };
                  }),
              ),
            );
          }

          const used = response.usage.total_tokens;
          await addTransaction(0, 1, used, user_id, body.session);

          results.gpt = content;
        }
        res.json(results);
      }
    } catch (e) {
      let error = {
        cause: {
          code: e.error?.message ?? "error",
        },
      };
      if (e.code === "content_filter") {
        // error.cause.code = "content_filter"
        // throw new Error(e.code)
        let results = {
          clip: [],
          book: [],
          gpt: null,
        };
        results.clip.push({
          image: `/assets/dusty/standard/warning.png`,
        });
        results.avatar = [13];
        results.gpt = `🚨 ${emergencyContact}`;
        await saveChat(body.query, "user", user_id, body.session, 0, 0);
        await saveChat(
          results.gpt,
          "system",
          user_id,
          body.session,
          0,
          JSON.stringify([13]),
        );
        res.json(results);
      }
    }
  }
});

chat.post("/history", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    throw new Error("No session info");
  }

  const user_id = session.user.userId;
  const query = db.prepare(
    `SELECT chat.session AS id, chat.user AS role, chat.content AS content, chat.avatar as avatar, chat.created AS created FROM chat WHERE chat.user_id = @user_id`,
  );
  const result = await query.all({ user_id });
  return res.json(
    result
      .map((r) => {
        if (r.role === "context") {
          const ctx = JSON.parse(r.content);
          if (ctx.clip && ctx.clip[0]) {
            r = {
              id: r.id,
              role: "system",
              content: ctx.clip[0].image,
              created: r.created,
              mediatype: "image",
            };
          } else {
            r = null;
          }
        } else {
          r.avatar = toArrayOrNumber(r.avatar);
        }
        return r;
      })
      .filter((c) => c !== null)
      .reduce((acc, r) => {
        if (r.role === "system" && r.content.match(/\<\/?s\>/)) {
          let rs = r.content
            .split(/\<\/?s\>/g)
            .filter((t) => t && t.trim().length > 0)
            .map((t) => {
              const u = {
                id: r.id,
                role: r.role,
                content: t,
                created: r.created,
              };
              if ("avatar" in r) {
                u.avatar = toArrayOrNumber("" + r.avatar);
              }
              return u;
            });
          acc = acc.concat(rs);
        } else {
          if ("avatar" in r) {
            r.avatar = toArrayOrNumber("" + r.avatar);
          }
          acc = acc.concat(r);
        }
        return acc;
      }, []),
  );
});

chat.get("/daily", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    throw new Error("No session info");
  }

  const dayIndex = (date, range) => ((getDayOfYear(date) - 1) % range) + 1;
  const getDayOfYear = (date) =>
    Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24,
    );

  let today = toZonedTime(new Date(), "Asia/Hong_Kong");
  const day = dayIndex(today, 239);
  res.json({ day });
});

chat.post("/collect/clip", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    throw new Error("No session info");
  }

  const user_id = session.user.userId;
  let today = new Date();
  const { body } = req;

  const stmt = db.prepare(
    `INSERT INTO user_collection (created, type, item_id, user_id) VALUES (@created, @type, @item_id, @user_id)`,
  );

  const result = await stmt.run({
    created: today.toISOString(),
    type: "clip",
    item_id: body.itemId,
    user_id: user_id,
  });
  res.json({
    message: "done",
  });
});

chat.post("/collect/letter", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    throw new Error("No session info");
  }

  const user_id = session.user.userId;
  let today = new Date();
  const { body } = req;

  const stmt = db.prepare(
    `INSERT INTO user_collection (created, type, item_id, user_id) VALUES (@created, @type, @item_id, @user_id)`,
  );

  const result = await stmt.run({
    created: today.toISOString(),
    type: "letter",
    item_id: body.itemId,
    user_id: user_id,
  });
  res.json({
    message: "done",
  });
});

export default chat;

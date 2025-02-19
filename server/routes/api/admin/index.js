import express from "express";
import sqlite from "better-sqlite3";
import { nanoid } from "nanoid";
import { auth } from "../../../auth/index.js";
import { signupLogic } from "../../../auth/signupLogic.js";
import { addTransaction } from "../../../ledger/index.js";
import { getChatHistory } from "../chat/index.js";
import { getContext } from "../context/index.js";
import { addPermission } from "../../../permission/index.js";
import { addActivation } from "../activation/index.js";
import { getStats } from "../collection/index.js";
import eqAnalyze from "../eqanalyze/index.js";

import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../../data/ainpc.db");
const db = new sqlite(dbPath, { verbose: console.log });

const admin = express.Router();

const validateNestedArray = (arr) => {
  return (
    Array.isArray(arr) &&
    arr.every(
      (row) =>
        row.length == 3 && typeof row[0] === "string" && row[1].length >= 4,
    )
  );
};

// Admin only
const bulkSignupLogic = async (req, res, providedList) => {
  if (!validateNestedArray(providedList)) {
    return res.status(400).send("Invalid input");
  }

  try {
    const userIds = await Promise.all(
      providedList.map(async (account) => {
        const user = await auth.createUser({
          key: {
            providerId: "username", // auth method
            providerUserId: account[0].toLowerCase(), // unique id when using "username" auth method
            password: account[1],
          },
          attributes: {
            username: account[0],
            role: account[2],
          },
        });
        const result = await addActivation(user.userId);
        if (emailRegex.test(account[0])) {
          const payload = {
            token: result.token,
          };
        }
        return user.userId;
      }),
    );
    if (providedList[0][3]) {
      const result_credit = await Promise.all(
        providedList.map((account, idx) =>
          addTransaction(parseInt(account[3]), 0, 0, userIds[idx], ""),
        ),
      );
    }
    return res.status(302).setHeader("Location", "/admin/user").end();
  } catch (e) {
    // this part depends on the database you're using
    // check for unique constraint error in user table

    return res.status(500).send("Error");
  }
};

const extractTopics = (str) => {
  return segment.doSegment(str, {
    stripStopword: true,
  });
};

const fillDatesWithZeros = (data) => {
  const dates = Object.keys(data);
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const formattedDate = date.toISOString().split("T")[0];
    data[formattedDate] = data[formattedDate] || 0;
  }

  return data;
};

admin.post("/stats", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const query = db.prepare(`
      SELECT
        (SELECT COUNT(id) FROM user) AS users,
        (SELECT SUM(debit) FROM ledger) AS debits,
        (SELECT SUM(credit) FROM ledger) AS credits,
        (SELECT COUNT(DISTINCT session) FROM chat) AS chats,
        (SELECT COUNT(id) FROM chat) AS threads
    `);
    const result = await query.get();
    const activity_query = db.prepare(`
      SELECT COUNT(DISTINCT session) AS count, DATE(created) AS date FROM chat GROUP BY date
    `);
    const activity_result = await activity_query.all();
    const activeuser_query = db.prepare(`
      SELECT COUNT(DISTINCT chat.user_id) AS count, DATE(created) AS date FROM chat GROUP BY date
    `);
    const activeuser_result = await activeuser_query.all();
    return res.json(
      Object.assign(result, {
        activity: fillDatesWithZeros(
          activity_result.reduce((acc, item) => {
            acc[item.date] = item.count;
            return acc;
          }, {}),
        ),
        activeuser: fillDatesWithZeros(
          activeuser_result.reduce((acc, item) => {
            acc[item.date] = item.count;
            return acc;
          }, {}),
        ),
      }),
    );
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/eqstats", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const query = db.prepare(`
      SELECT DATE(chat.created) AS date, eq_emotion.emotion AS emotion, avg(eq_emotion.value) AS value
      FROM eq_emotion
      JOIN chat ON chat.session = eq_emotion.session
      GROUP BY date, emotion
    `);
    const result = await query.all();
    const result_ = result.reduce((acc, row) => {
      if (!acc[row.date]) {
        acc[row.date] = [];
      }
      acc[row.date].push({
        emotion: row.emotion,
        value: row.value,
      });
      return acc;
    }, {});
    const sessions = Object.keys(result_).map((d) => {
      return {
        date: d,
        data: eqAnalyze.normalizeEQ(result_[d]),
        detail: result_[d].sort((a, b) => {
          return b.value - a.value;
        }),
      };
    });
    return res.json(sessions);
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/users/list", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const query = db.prepare(
      `SELECT DISTINCT user.id AS id, user.username AS username, user.role AS role, user_balance.balance AS balance, (SELECT GROUP_CONCAT(tag) FROM user_tag WHERE user_id = user.id) AS tag, user.activated AS activated FROM user LEFT JOIN user_balance ON user_balance.user_id = user.id ORDER BY id DESC LIMIT 100`,
    );
    const result = await query.all();
    const result_ = result.map((r) => {
      if (r.tag) {
        r.tag = r.tag.split(",");
      }
      return r;
    });
    return res.json(result_);
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/users/active", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const query = (days) => {
      return db.prepare(`
       SELECT COUNT(DISTINCT chat.user_id) AS active_user_count
       FROM chat
       LEFT JOIN user ON user.id = chat.user_id
       WHERE DATETIME(chat.created) >= DATETIME('now', '-${days} day')
       AND user.role = 'user'
        `);
    };
    const results = await Promise.all([
      query("1").all(),
      query("7").all(),
      query("15").all(),
      query("30").all(),
      query("60").all(),
      query("90").all(),
    ]);

    return res.json({
      1: results[0][0].active_user_count,
      7: results[1][0].active_user_count,
      15: results[2][0].active_user_count,
      30: results[3][0].active_user_count,
      60: results[4][0].active_user_count,
      90: results[5][0].active_user_count,
    });
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/users/create", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    return signupLogic(req, res, false);
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/users/bulkcreate", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const { list, role } = req.body;
    const autogenparams = list.split("\n")[0].split(",");
    if (autogenparams[0] === "autogen") {
      const prefix = autogenparams[1];
      const count = parseInt(autogenparams[2]);
      const autoList = Array.from({ length: count }, (_, idx) => [
        `${prefix}-${++idx}`,
        nanoid(10),
        role,
      ]);
      return bulkSignupLogic(req, res, autoList);
    } else {
      const _list = list
        .trim()
        .split("\n")
        .map((l) => l.trim().split(","));
      return bulkSignupLogic(req, res, _list);
    }
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/users/delete", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const { id, role } = req.body;
    if (role !== "admin") {
      try {
        await auth.invalidateAllUserSessions(id);
        await db
          .prepare(
            `DELETE FROM user_permission WHERE user_id = @id OR moderator_id = @id`,
          )
          .run({ id });
        await db.prepare(`DELETE FROM ledger WHERE user_id = @id`).run({ id });
        await db
          .prepare(`DELETE FROM user_balance WHERE user_id = @id`)
          .run({ id });
        await db.prepare(`DELETE FROM chat WHERE user_id = @id`).run({ id });
        await db
          .prepare(`DELETE FROM user_profile WHERE user_id = @id`)
          .run({ id });
        await db
          .prepare(`DELETE FROM user_key WHERE user_id = @id`)
          .run({ id });
        await db
          .prepare(`DELETE FROM activation_token WHERE user_id = @id`)
          .run({ id });
        await db.prepare(`DELETE FROM user WHERE id = @id`).run({ id });
        return res.status(302).setHeader("Location", "/admin/user").end();
      } catch (e) {
        return res.sendStatus(401);
      }
    } else {
      return res.sendStatus(401);
    }
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/chats/list", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const result = await getChatHistory();
    return res.json(result.reverse());
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/chats/context", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const result = await getContext();
    const clip = result.clip;
    const book = result.book;
    return res.json({ clip, book });
  }
});

admin.post("/chats/eqanalyze", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (session && session.user.role === "admin") {
    const { body } = req;
    const threads = body.threads;
    const data = await eqAnalyze.get(threads.session);
    if (data) {
      return res.json(data);
    } else {
      const result = await eqAnalyze.run(threads);
      return res.json(JSON.parse(result));
    }
  }
});

admin.post("/chats/eqlist", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (session && session.user.role === "admin") {
    const { body } = req;
    const threads = body.threads;
    const data = await eqAnalyze.getAll();
    return res.json(data);
  }
});

admin.post("/credit/add", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const { credit, username } = req.body;
    const query = db.prepare(`SELECT id FROM user WHERE username = @username`);
    const lookup = await query.get({ username });
    if (!lookup) {
      return res.sendStatus(401);
    }
    await addTransaction(credit, 0, 0, lookup.id, "");
    return res.status(302).setHeader("Location", "/admin").end();
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/permission/add", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const { modid, list } = req.body;
    const _list = list
      .trim()
      .split("\n")
      .map((r) => r.trim());
    const query = db.prepare(`SELECT id FROM user WHERE username = @username`);
    const queryMany = (usernames) => {
      return Promise.all(
        usernames.map((u) =>
          query.get({
            username: u,
          }),
        ),
      );
    };
    const userIds = await queryMany(_list);
    if (userIds.some((value) => typeof value === "undefined")) {
      // console.log(userIds.map((val, key) => [_list[key], val]));
      console.log(
        userIds.map((val, key) => [_list[key], val]).filter((d) => !d[1]),
      );
      return res.status(401).send("Invalid username.");
    }
    const users = userIds.filter((row) => row && row.id).map((row) => row.id);
    await Promise.all(users.map((id) => addPermission(id, modid)));
    return res.status(302).setHeader("Location", "/admin/user").end();
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/tokenusage", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const query = db.prepare(
      `SELECT SUM(token) AS token_used, DATE(created) AS date FROM ledger INNER JOIN user ON ledger.user_id = user.id WHERE user.role = 'user' GROUP BY date ORDER BY date`,
    );

    const data = await query.all();
    return res.json(data);
  }
});

admin.post("/dailyusage", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const data = await getStats();
    return res.json(data);
  }
});

admin.post("/backup", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    return db
      .backup(
        path.resolve(__dirname, `../../../data/backup/backup-${timestamp}.db`),
      )
      .then(() => {
        return res.json({
          message: "backup completed",
        });
      })
      .catch((err) => {
        console.log("backup failed:", err);
      });
  }
});

admin.post("/report/tags", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (session && session.user.role === "admin") {
    const query = db.prepare(`
      SELECT user_tag.tag AS tag FROM user_tag GROUP BY tag
    `);
    const result = await query.all({
      id: session.user.userId,
    });
    return res.json(result.map((r) => r.tag));
  } else {
    return res.sendStatus(401);
  }
});

admin.post("/report/active_user", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (session && session.user.role === "admin") {
    const { body } = req;

    const query = (days) => {
      return db.prepare(`SELECT
        id, username, COUNT(cid) AS count FROM
        (SELECT DISTINCT user.id AS id, user.username AS username, chat.created, chat.id AS cid, chat.user_id, chat.user AS role FROM user JOIN chat ON chat.user_id = user.id JOIN user_tag ON user_tag.user_id = user.id WHERE user_tag.tag LIKE @tag) AS chat
        WHERE DATETIME(chat.created) > DATETIME('now', '-${days} day')
        AND role = 'user'
        GROUP BY chat.user_id ORDER BY count DESC`);
    };

    const activeuser_query = db.prepare(`
      SELECT COUNT(DISTINCT chat.user_id) AS count, DATE(chat.created) AS date FROM chat
      JOIN user_tag ON user_tag.user_id = chat.user_id
      WHERE user_tag.tag LIKE @tag
      GROUP BY date
    `);
    const results = await Promise.all([
      query("1").all({
        mod_id: session.user.userId,
        tag: body.tag + "%",
      }),
      query("7").all({
        mod_id: session.user.userId,
        tag: body.tag + "%",
      }),
      query("15").all({
        mod_id: session.user.userId,
        tag: body.tag + "%",
      }),
      query("30").all({
        mod_id: session.user.userId,
        tag: body.tag + "%",
      }),
      query("60").all({
        mod_id: session.user.userId,
        tag: body.tag + "%",
      }),
      query("90").all({
        mod_id: session.user.userId,
        tag: body.tag + "%",
      }),
      activeuser_query.all({
        mod_id: session.user.userId,
        tag: body.tag + "%",
      }),
    ]);

    return res.json({
      1: results[0].length,
      7: results[1].length,
      15: results[2].length,
      30: results[3].length,
      60: results[4].length,
      90: results[5].length,
      daily: fillDatesWithZeros(
        results[6].reduce((acc, item) => {
          acc[item.date] = item.count;
          return acc;
        }, {}),
      ),
    });
  } else {
    return res.sendStatus(401);
  }
});

export default admin;

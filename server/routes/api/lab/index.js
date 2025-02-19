import express from "express";
import sqlite from "better-sqlite3";
import { auth } from "../../../auth/index.js";
import { model, openAI } from "../chat/openai.js";

import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../../data/ainpc.db");
const db = new sqlite(dbPath, { verbose: console.log });
const lab = express.Router();

lab.post("/groupchat/description", async (req, res) => {
  const { body } = req;
  const basePrompt = `
    Generate character name, description, system prompt, personality based on the provided role, race and gender.
    role: ${body.role}
    race: ${body.race},
    gender: ${body.gender}

    JSON output:
    {
      name: "",
      description: "",
      system_prompt: "",
      // range 0-100
      personality_bigfive: {
        "openness": 0,
        "conscientiousness": 0,
        "extraversion": 0,
        "agreeableness": 0,
        "neuroticism": 0
      },
      personality_mbti: ""
    }
  `;
  const systemPrompt = basePrompt;

  let messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // If there are previous messages, append
  messages = messages.concat(
    body.log?.map((m) => ({
      role: m.role,
      content: m.content,
    })) ?? [],
  );

  try {
    const result = await openAI.chat.completions.create({
      model: model,
      messages: messages,
      response_format: { type: "json_object" },
    });

    let content = "";
    content = result.choices[0]?.message?.content;
    content = JSON.parse(content);
    content = content[0];

    res.json({ content });
  } catch (e) {
    res.json(e);
  }
});

lab.post("/groupchat/completion", async (req, res) => {
  const basePrompt = `
      <BASE PROMPT START>
      You are a character in a RPG game. Respond to the query while closely following the system prompt and personality defined below. Do not respond as any other character.
      </BASE PROMPT END>
      <SYSTEM PROMPT>
    `;

  const { body } = req;
  const systemPrompt =
    basePrompt + body.instruction.trim() + "</SYSTEM PROMPT>";

  // Provide system prompt
  let messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // If there are previous messages, append
  messages = messages.concat(
    body.log?.map((m) => ({
      role: m.role,
      content: m.content,
    })) ?? [],
  );

  try {
    const result = await openAI.chat.completions.create({
      model: model,
      messages: messages,
    });

    let content = "";
    content = result.choices[0]?.message?.content;

    res.json({ content });
  } catch (e) {
    res.json(e);
  }
});

export default lab;

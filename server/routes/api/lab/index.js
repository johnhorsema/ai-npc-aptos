import express from "express";
import sqlite from "better-sqlite3";
import { auth } from "../../../auth/index.js";
import { model, dustyOpenAI } from "../chat/openai.js";

import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../../data/ainpc.db");
const db = new sqlite(dbPath, { verbose: console.log });
const lab = express.Router();

lab.post("/groupchat/completion", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (session && session.user.role === "tester") {
    const user_id = session.user.userId;
    const role = session.user.role;

    const basePrompt = `
      <BASE PROMPT START>
      Don't generate next message until prior one completed/line per user and talk an learn amongst themselves/output in one window like msn/discord like chat room style/User can't send messages BUT can set the initial guiding context. Conversation and bots begin conversing once start conversation button pressed/Conversation speed toggle and options to procedurally dd more AI agents to the mix while conversation is happening.

      Responses usually only 1-2 sentences. Occasionally more if contextually appropriate but no more than 3-4 sentences, stick to being concise.

      Ensure speed toggle can never be quicker then the generation to avoid errors/if error generating try again/ensure agents ALWAYS respond to the correct prior agent.
      </BASE PROMPT END>
      <PROMPT START>
    `;

    const { body } = req;
    const systemPrompt = basePrompt + body.instruction.trim() + "</PROMPT END>";

    if (role !== "tester") {
      res.json({
        cause: {
          code: "Unauthorized.",
        },
      });
    } else {
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
        const result = await dustyOpenAI.chat.completions.create({
          model: model.dusty,
          messages: messages,
        });

        let content = "";
        content = result.choices[0]?.message?.content;

        res.json({ content });
      } catch (e) {
        res.json(e);
      }
    }
  } else {
    return res.sendStatus(401);
  }
});

export default lab;

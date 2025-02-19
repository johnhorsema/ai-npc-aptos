import sqlite from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../../data/ainpc.db");
const db = new sqlite(dbPath, { verbose: console.log });

export const saveChat = async function (
  msg,
  user = "",
  userId,
  session = "",
  publicFlag,
  avatar,
) {
  let today = new Date();
  const stmt = db.prepare(
    `INSERT INTO chat (created, session, content, user, user_id, public, avatar) VALUES (@created, @session, @content, @user, @user_id, @public, @avatar)`,
  );
  const result = await stmt.run({
    created: today.toISOString(),
    session: session,
    content: msg,
    user_id: userId,
    user: user,
    public: publicFlag,
    avatar: avatar,
  });
  return result;
};

import sqlite from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../../data/dusty.db");
const db = new sqlite(dbPath, { verbose: console.log });

export const logContext = async function(docId, session = "", score = 0) {
  const stmt = db.prepare(`INSERT INTO context (doc_id, session, score) VALUES (@doc_id, @session, @score)`)
  const result = await stmt.run({
    doc_id: docId,
    session: session,
    score: score
  });
  return result;
};

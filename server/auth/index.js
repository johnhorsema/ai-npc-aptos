import { lucia } from "lucia";
import { express } from "lucia/middleware";
import { betterSqlite3 } from "@lucia-auth/adapter-sqlite";
import "lucia/polyfill/node";

import sqlite from "better-sqlite3";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../data/dusty.db");
const db = new sqlite(dbPath, { verbose: console.log });

export const auth = lucia({
  adapter: betterSqlite3(db, {
    user: "user",
    session: "user_session",
    key: "user_key",
  }),
  middleware: express(),
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  getUserAttributes: (data) => {
    return {
      username: data.username,
      role: data.role,
      activated: data.activated,
    };
  },
});

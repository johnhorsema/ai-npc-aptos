import { auth } from "../auth/index.js";

import sqlite from "better-sqlite3";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../data/dusty.db");
const db = new sqlite(dbPath, { verbose: console.log });
db.exec(
  fs.readFileSync(path.resolve(__dirname, "../routes/schema.sql"), "utf8"),
);

import { addTransaction } from "../ledger/index.js";
import { addActivation } from "../routes/api/activation/index.js";

let initCredit = async (payload) => {
  const insertToUserBalance = db.prepare(`
    INSERT INTO user_balance (user_id, balance)
    VALUES (@user_id, @balance)
  `);
  await insertToUserBalance.run({
    user_id: payload.user_id,
    balance: 0,
  });
  await addTransaction(payload.credit, 0, 0, payload.user_id, "");
};

let deductCredit = async (payload) => {
  await addTransaction(0, payload.debit, payload.user_id, "");
};

let addUser = async (payload) => {
  const { username, password, role, credit } = payload;
  const user = await auth.createUser({
    key: {
      providerId: "username", // auth method
      providerUserId: username.toLowerCase(), // unique id when using "username" auth method
      password, // hashed by Lucia
    },
    attributes: {
      username,
      role,
    },
  });
  await db.prepare(`UPDATE user SET activated = 1 WHERE id = @user_id`).run({
    user_id: user.userId,
  });
  console.log(`User created: ${username}(${user.userId}).`);

  initCredit({
    credit: credit ? credit : 25,
    user_id: user.userId,
  });
  console.log(`Added ${credit} credits to ${username}.`);
  // const deduction = Math.floor(Math.random() * 100);
  // deductCredit({
  //   debit: deduction,
  //   user_id: user.userId
  // });
  // console.log(`Deducted ${deduction} credits from ${username}.`)
  return user;
};

addUser({
  username: "user",
  password: "user",
  role: "user",
  credit: 100,
});

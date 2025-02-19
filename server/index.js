import express from "express";
import { LuciaError } from "lucia";
import { auth } from "./auth/index.js";
import routes from "./routes/index.js";

import sqlite from "better-sqlite3";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "./data/dusty.db");
const db = new sqlite(dbPath, { verbose: console.log });
db.exec(
  fs.readFileSync(path.resolve(__dirname, "./routes/schema.sql"), "utf8"),
);

const app = express();

app.use(express.urlencoded({ extended: true })); // for application/x-www-form-urlencoded (forms)
app.use(express.json()); // for application/json
// Serve static files
app.use("/assets", express.static(path.join(__dirname, "../dist/assets")));

app.get("/", async (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

app.get("/login", async (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Basic Check
  if (
    typeof username !== "string" ||
    username.length < 1 ||
    username.length > 31 ||
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 255
  ) {
    return res
      .status(302)
      .setHeader("Location", "/login?error=Incorrect username or password")
      .end();
  }

  try {
    // find user by key
    // and validate password
    const key = await auth.useKey("username", username.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(req, res);
    authRequest.setSession(session);
    // Role: Admin
    if (session.user.role === "admin") {
      return res.status(302).setHeader("Location", "/admin").end();
    }
    // Role: Moderator
    else if (session.user.role === "moderator") {
      if (session.user.activated == 0) {
        const tokenId = await db
          .prepare(`SELECT id FROM activation_token WHERE user_id = @user_id`)
          .get({
            user_id: session.user.userId,
          });
        return res
          .status(302)
          .setHeader("Location", `/activate/${tokenId.id}`)
          .end();
      } else {
        return res.status(302).setHeader("Location", "/moderator").end();
      }
    }
    // Role: Editor
    else if (session.user.role === "editor") {
      return res.status(302).setHeader("Location", "/editor").end();
    }
    // Role: Tester
    else if (session.user.role === "tester") {
      return res.status(302).setHeader("Location", "/lab").end();
    }
    // Role: User
    else if (session.user.role === "user") {
      if (session.user.activated == 0) {
        const tokenId = await db
          .prepare(`SELECT id FROM activation_token WHERE user_id = @user_id`)
          .get({
            user_id: session.user.userId,
          });
        return res
          .status(302)
          .setHeader("Location", `/activate/${tokenId.id}`)
          .end();
      } else {
        return res.status(302).setHeader("Location", "/chat").end();
      }
    } else {
      return res.status(302).setHeader("Location", "/").end();
    }
  } catch (e) {
    // check for unique constraint error in user table
    if (
      e instanceof LuciaError &&
      (e.message === "AUTH_INVALID_KEY_ID" ||
        e.message === "AUTH_INVALID_PASSWORD")
    ) {
      // user does not exist
      // or invalid password
      return res
        .status(302)
        .setHeader("Location", "/login?error=Incorrect username or password")
        .end();
    }

    return res
      .status(302)
      .setHeader("Location", "/login?error=An unknown error occurred")
      .end();
  }
});

app.get("/authstatus", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
  if (session) {
    if (session.user.activated == 0) {
      return res.status(400).send(false).end();
    }
    const user = session.user;
    return res.json(user);
  }
  return res.status(400).send(false).end();
});

app.post("/logout", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
  if (!session) {
    return res.sendStatus(401);
  }
  await auth.invalidateSession(session.sessionId);

  authRequest.setSession(null); // for session cookie

  // redirect back to login page
  return res.status(302).setHeader("Location", "/login").end();
});

app.use("/api/lab", routes.api.lab);

// Start server
const server = app.listen(3000, () => {
  console.log("Express is running at http://localhost:3000");
});

server.setTimeout(20 * 60000);

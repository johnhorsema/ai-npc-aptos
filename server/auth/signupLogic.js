import sqlite from "better-sqlite3";
import { auth } from "./index.js";
import { addPermission } from "../permission/index.js";
import { nanoid } from "nanoid";
import { addActivation } from "../routes/api/activation/index.js";

export const signupLogic = async (
  req,
  res,
  postredirect = true,
  modId = null,
) => {
  const username = req.body.username.trim().toLowerCase();
  const role = req.body.role;
  const password = nanoid(8);
  // basic check
  if (
    typeof username !== "string" ||
    username.length < 4 ||
    username.length > 31
  ) {
    return res.status(400).send("Invalid username");
  }
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return res.status(400).send("Invalid password");
  }
  if (
    typeof role !== "string" ||
    ["user", "admin", "moderator", "editor", "tester"].indexOf(role) == -1
  ) {
    return res.status(400).send("Invalid role");
  }
  try {
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
    const result = await addActivation(user.userId);

    // TEMP_MEASURE
    if (
      modId !== null &&
      [
        "3tb1kxvwk4am91m",
        "awwq7ctoul8s7do",
        "49zmrh1r3z127ln",
        "sjnpdvjzkhyppb1",
        "i9lhx1yymptbpwk",
        "oz3vhgvs0papnte",
        "b2dbhhqvmkk7czo",
        "dko6qro4pim4tjx",
        "thek5yp4rjhywq9",
        "7ujdadihld7926t",
        "sybehsn2h9ic9h5",
        "cvqek9rizmffgr3",
        "x3s0hvqk4xr66yy",
        "t6hagapguzel1oi",
        "3ogmkfmzkj8c5fp",
        "0lik4m8xtmhd1lk",
        "8bbcvjrdxtved6k",
        "uaezq2mcqd9uu90",
        "2ohfrpyf2e5rvd1",
        "j67o9qekkhn97n6",
        "2qtnuc2rupdbbpq",
        "ywl29w3pnxz9uj1",
        "h7w4l80xg08q7iq",
        "khhi2lcw9ruvenh",
        "djwp0lh5vsv2fis",
        "exzajjr458aqei9",
        "8rv7h4p69mr394g",
        "jz578i6040ch606",
        "cxuimfqpbb2bfxd",
        "k83ytbdlonqti6m",
        "bf8viyq9wgxt5k5",
        "5rsbmeb82zm63hp",
        "byxvr7m39lfm1n0",
        "orilumttwzgtl7n",
        "o240sgr2ozybthm",
        "gbzzms1zbplb7tv",
        "v5h2mt96vvgr5yz",
        "pc7qugqijtwrqv7",
        "v0a1tw0zi7t555r",
        "mt55rvylps7mt8n",
        "fg1bb7glwia2np9",
        "yvz4ubtwz120pdu",
        "sslw67vydte089j",
        "86ou26ak1qa48gt",
        "tkr2pr8iobfitpr",
        "xvcsfruv7miv74m",
        "79z9bclcabs9nm1",
        "l893xcjt5bi5sks",
        "ese5z7uy8umjuvc",
        "f54w4sobhs9qsg7",
        "m0cploumd39gyu5",
        "rxumu3cvagtnepi",
        "gy0ekz2nqphei3r",
        "qifse6do7gnsfcf",
        "bb1ceaxq23wetbr",
      ].indexOf(modId) == -1
    ) {
      await addPermission(user.userId, modId);
    }
    // Check username as email
    if (emailRegex.test(username)) {
      const payload = {
        token: result.token,
      };
    }
    res.json(result);
    // if (postredirect) {
    //   const session = await auth.createSession({
    //     userId: user.userId,
    //     attributes: {
    //       role,
    //     },
    //   });
    //   const authRequest = auth.handleRequest(req, res);
    //   authRequest.setSession(session);
    //   return res.status(302).setHeader("Location", "/chat").end();
    // } else {
    //   if (modId !== null) {
    //     return res.status(302).setHeader("Location", "/moderator").end();
    //   } else {
    //     return res.status(302).setHeader("Location", "/admin").end();
    //   }
    // }
  } catch (e) {
    // this part depends on the database you're using
    // check for unique constraint error in user table
    if (
      e instanceof sqlite.SqliteError &&
      e.message === "UNIQUE constraint failed: user.username"
    ) {
      return res.status(400).send("Username already taken");
    }

    return res.status(500).send("An unknown error occurred");
  }
};

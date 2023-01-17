import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import session from "express-session";
import mongoSession, { MongoDBSessionOptions } from "connect-mongodb-session";

import authRoutes from "./auth/auth.routes.js";
import badgesRoutes from "./api/badges.routes.js";
import documentiRoutes from "./api/documenti.routes.js";
import calendarioRoutes from "./api/calendario.routes.js";
import SessionUser from "./types/SessionUser.js";
import reqLogger from "./middlewares/reqLogger.js";
import IgnoredReqs from "./middlewares/IgnoredReqs.js";

declare module "express-session" {
  interface SessionData {
    user: SessionUser | null;
  }
}

const app = express();

// pwd
const __dirname = path.resolve();

// define session storage
const MongoDBStore = mongoSession(session);

console.log("App environment:", process.env.NODE_ENV);
if (process.env.NODE_ENV == "development") {
  // dotenv config
  dotenv.config();
} /* else if(process.env.NODE_ENV == "production" || process.env.NODE_ENV == "staging") {
  // secure session cookies on
  app.set("trust proxy", 1);
  sess!.cookie!.secure = true;
} */

// express-session configs
const sess: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "session secret",
  cookie: {
    sameSite: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 90 // 3 months in MS
  },
  resave: true,
  saveUninitialized: true,
};

// secure session cookies on
app.set("trust proxy", 1);
sess!.cookie!.secure = true;

// create session storage
const store = new MongoDBStore({
  uri: process.env.ACCESSI_DB_URI,
  collection: "sessions",
  expires: 1000 * 60 * 60 * 24 * 90, // 3 months in MS
} as MongoDBSessionOptions);

store.on("error", function(error) {
  console.error(error);
});

sess.store = store;

// print out request endpoint url & method
app.use(reqLogger);

// use cors middleware
app.use(
  cors({
    exposedHeaders: ["guest-token", "admin-token"],
    credentials: true,
    origin: "https://localhost:3000",
  })
);

// serve ignored reqs
app.use(IgnoredReqs.optionsMethod);
app.use(IgnoredReqs.favicon);
app.use(IgnoredReqs.home);

// use express-session middleware
app.use(session(sess));
app.use((req, res, next) => {
  console.log(`${req.ip} ${req.method} ${req.url} ${req.sessionID}`);
  next();
});

// use bodyparser middlewares
app.use(express.json());

// use file uploader middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.resolve(__dirname, "server/tmp"),
  })
);

// public route
app.use(
  "/api/v1/public",
  express.static(path.resolve(__dirname, "server/public"))
);

// routes
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/badges", badgesRoutes);
app.use("/api/v1/documenti", documentiRoutes);
app.use("/api/v1/calendario", calendarioRoutes);

// backend make public and get compiled react app
if (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "staging") {
  app.use(express.static(path.resolve(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
  });
}

// failed request
app.get("*", (req, res) => res.status(404).send("page not found"));

export default app;

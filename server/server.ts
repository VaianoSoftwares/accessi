import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";

import authRoutes from "./auth/auth.routes.js";
import badgesRoutes from "./api/badges.routes.js";
import documentiRoutes from "./api/documenti.routes.js";
import protocolloRoutes from "./api/protocollo.routes.js";
import reqLogger from "./middlewares/reqLogger.js";
import IgnoredReqs from "./middlewares/IgnoredReqs.js";

const app = express();

console.log("App environment:", process.env.NODE_ENV);
if (process.env.NODE_ENV == "development") {
  // dotenv config
  dotenv.config();
}

// print out request endpoint url & method
app.use(reqLogger);

// use cors middleware
app.use(
  cors({
    exposedHeaders: "x-access-token",
  })
);

// serve ignored reqs
app.use(IgnoredReqs.optionsMethod);
app.use(IgnoredReqs.favicon);
app.use(IgnoredReqs.home);

// use bodyparser middlewares
app.use(express.json());

// use file uploader middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.resolve("server", "tmp"),
  })
);

// public route
app.use("/api/v1/public", express.static(path.resolve("server", "public")));

// routes
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/badges", badgesRoutes);
app.use("/api/v1/documenti", documentiRoutes);
app.use("/api/v1/protocollo", protocolloRoutes);

// backend make public and get compiled react app
if (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "staging") {
  app.use(express.static(path.resolve("client", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("client", "dist", "index.html"));
  });
}

// failed request
app.get("*", (req, res) => res.status(404).send("invalid request"));

export default app;

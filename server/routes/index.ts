import express, { Express } from "express";
import users from "./users.js";
import badges from "./badges.js";
import archivio from "./archivio.js";
import protocolli from "./protocolli.js";
import clienti from "./clienti.js";
import postazioni from "./postazioni.js";
import path from "path";

export default function mountRoutes(app: Express) {
  app.use("/api/v1/users", users);
  app.use("/api/v1/badges", badges);
  app.use("/api/v1/archivio", archivio);
  app.use("/api/v1/protocolli", protocolli);
  app.use("/api/v1/clienti", clienti);
  app.use("/api/v1/postazioni", postazioni);

  // public route
  app.use("/api/v1/public", express.static(path.resolve("server", "public")));

  // get compiled react app request if app is in production mode
  if (
    process.env.NODE_ENV == "production" ||
    process.env.NODE_ENV == "staging"
  ) {
    app.use(express.static(path.resolve("client", "dist")));
    app.get("*", (_, res) => {
      res.sendFile(path.resolve("client", "dist", "index.html"));
    });
  }

  // failed request
  app.get("*", (_, res) => res.status(404).send("invalid request"));
}

import { Express } from "express";
import users from "./users.js";
import badges from "./badges.js";
import archivio from "./archivio.js";
import protocolli from "./protocolli.js";
import clienti from "./clienti.js";
import postazioni from "./postazioni.js";

export default function mountRoutes(app: Express) {
  app.use("/api/v1/users", users);
  app.use("/api/v1/badges", badges);
  app.use("/api/v1/archivio", archivio);
  app.use("/api/v1/protocolli", protocolli);
  app.use("/api/v1/clienti", clienti);
  app.use("/api/v1/postazioni", postazioni);
}

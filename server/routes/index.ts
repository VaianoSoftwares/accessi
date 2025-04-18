import { Express } from "express";
import users from "./users.js";
import nominativi from "./nominativi.js";
import provvisori from "./provvisori.js";
import archivio from "./archivio.js";
import protocolli from "./protocolli.js";
import clienti from "./clienti.js";
import postazioni from "./postazioni.js";
import chiavi from "./chiavi.js";
import veicoli from "./veicoli.js";
import mazzi from "./mazzi.js";
import sse from "./sse.js";

export default function mountRoutes(app: Express) {
  app.use("/api/v1/users", users);
  app.use("/api/v1/nominativi", nominativi);
  app.use("/api/v1/archivio", archivio);
  app.use("/api/v1/protocolli", protocolli);
  app.use("/api/v1/clienti", clienti);
  app.use("/api/v1/postazioni", postazioni);
  app.use("/api/v1/provvisori", provvisori);
  app.use("/api/v1/chiavi", chiavi);
  app.use("/api/v1/veicoli", veicoli);
  app.use("/api/v1/mazzi", mazzi);
  app.use("/api/v1/sse", sse);
}

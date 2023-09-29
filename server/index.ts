import app from "./server.js";
import https from "https";
import mongodb from "mongodb";
import fs from "fs";
import path from "path";

const privateKey = fs.readFileSync(path.join("server", "certs", "server.key"));
const certificate = fs.readFileSync(path.join("server", "certs", "server.crt"));

const credentials = {
  key: privateKey,
  cert: certificate,
};

import BadgesDAO from "./dao/badges.dao.js";
import ArchivioDAO from "./dao/archivio.dao.js";
import UsersDAO from "./dao/users.dao.js";
import EnumsDAO from "./dao/enums.dao.js";
import DocumentiDAO from "./dao/documenti.dao.js";
import PrestitiDAO from "./dao/prestiti.dao.js";
import PostazioniDAO from "./dao/postazioni.dao.js";
import ProtocolloDAO from "./dao/protocollo.dao.js";

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 4316;
const httpsServer = https.createServer(credentials, app);

MongoClient.connect(process.env.ACCESSI_DB_URI || "")
  .then(async (client) => {
    await BadgesDAO.injectDB(client);
    await ArchivioDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    await EnumsDAO.injectDB(client);
    await DocumentiDAO.injectDB(client);
    await PrestitiDAO.injectDB(client);
    await PostazioniDAO.injectDB(client);
    await ProtocolloDAO.injectDB(client);

    httpsServer.listen(port, () =>
      console.log(`HTTPS Server running on port ${port}.`)
    );

    httpsServer.keepAliveTimeout = 1000 * 60 * 60 * 24; // 1 day in MS
    httpsServer.headersTimeout = httpsServer.keepAliveTimeout + 1000;
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });

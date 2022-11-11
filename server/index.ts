import app from "./server.js";
import https from "https";
import mongodb from "mongodb";
import fs from "fs";
import path from "path";

const privateKey = fs.readFileSync(path.join("server", "certs", "server.key"));
const certificate = fs.readFileSync(
  path.join("server", "certs", "server.cert")
);

const credentials = {
  key: privateKey,
  cert: certificate
};

import BadgesDAO from "./dao/badges.dao.js";
import ArchivioDAO from "./dao/archivio.dao.js";
import UsersDAO from "./dao/users.dao.js";
import EnumsDAO from "./dao/enums.dao.js";
import PermessiDAO from "./dao/permessi.dao.js";
import DocumentiDAO from "./dao/documenti.dao.js";

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 443;
const httpsServer = https.createServer(credentials, app);

MongoClient.connect(process.env.ACCESSI_DB_URI || "")
  .then(async client => {
    await BadgesDAO.injectDB(client);
    await ArchivioDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    await EnumsDAO.injectDB(client);
    await PermessiDAO.injectDB(client);
    await DocumentiDAO.injectDB(client);
    
    httpsServer.listen(port, () => console.log(`HTTPS Server running on port ${port}.`));
    
    httpsServer.keepAliveTimeout = 1000 * 60 * 60 * 24;
    httpsServer.headersTimeout = httpsServer.keepAliveTimeout + 1000;
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
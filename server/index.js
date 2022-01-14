import app from "./server.js";
import mongodb from "mongodb";
import https from "https";
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

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 5000;
const httpsServer = https.createServer(credentials, app);

MongoClient.connect(process.env.ACCESSI_DB_URI)
  .then(async client => {
    await BadgesDAO.injectDB(client);
    await ArchivioDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    await EnumsDAO.injectDB(client);
    // app.listen(port, () => console.log(`Server listening on port ${port}.`));
    httpsServer.listen(port, () => console.log(`HTTPS Server running on port ${port}.`));
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
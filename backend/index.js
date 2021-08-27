import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
/*
import https from "https";
import fs from "fs";
import path from "path";
*/

import BadgesDAO from "./dao/badges.dao.js";
import ArchivioDAO from "./dao/archivio.dao.js";
import UsersDAO from "./dao/users.dao.js";
import EnumsDAO from "./dao/enums.dao.js";

//const __dirname = path.resolve("../backend");

dotenv.config();

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 5000;
/*
const port = process.env.HTTPS_PORT || 5001;
const options = {
  ca: [],
  cert: fs.readFileSync(path.resolve(__dirname, "cert", "selfisigned.key")),
  key: fs.readFileSync(path.resolve(__dirname, "cert", "selfsigned.crt"))
};
*/

MongoClient.connect(process.env.ACCESSI_DB_URI)
  .then(async client => {
    await BadgesDAO.injectDB(client);
    await ArchivioDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    await EnumsDAO.injectDB(client);
    app.listen(port, () => console.log(`Server listening on port ${port}.`));
    /*
    const server = https.createServer(options, app);
    server.listen(port, () => console.log(`HTTPS Server running on port ${port}.`));
    */
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
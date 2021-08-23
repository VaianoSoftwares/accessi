import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";

import BadgesDAO from "./dao/badges.dao.js";
import ArchivioDAO from "./dao/archivio.dao.js";
import UsersDAO from "./dao/users.dao.js";
import EnumsDAO from "./dao/enums.dao.js";

dotenv.config();

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 5000;

MongoClient.connect(process.env.ACCESSI_DB_URI)
  .then(async client => {
    await BadgesDAO.injectDB(client);
    await ArchivioDAO.injectDB(client);
    await UsersDAO.injectDB(client);
    await EnumsDAO.injectDB(client);
    app.listen(port, () => console.log(`Server listening on port ${port}.`));
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
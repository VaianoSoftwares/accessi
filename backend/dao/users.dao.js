import BadgesDAO from "./badges.dao.js";

let users;

export default class UsersDAO {
    static async injectDB(conn) {
        if(users) {
            return;
        }

        try {
            users = await conn.db(process.env.DB_NAME).collection("users");
        } catch(err) {
            console.log(`Failed to inject DB. ${err}`);
        }
    }

    static async addUser(data) {
        try {
            const user = await users.findOne({ username: data.username });
            if(user) {
                throw new Error(`Username ${data.username} già utilizzato.`);
            }

            const nom = await BadgesDAO.findBadgeByBarcode(data.nominativo);
            if(data.tipo_utente !== "admin" || !nom) {
                data.tipo_utente = "guest";
            }

            const response = await users.insertOne(data);
            return response;
        } catch(err) {
            console.log(`addUser - ${err}`);
            return { error: err };
        }
    }

    static async getUserByName(username) {
        try {
            return await users.findOne({ username: username });
        } catch(err) {
            console.log(`login - ${err}`);
        }
    }

    static async getTipiUtenti() {
        try {
          const tipiUtenti = await users.distinct("tipo_utente");
          return tipiUtenti;
        } catch (err) {
          console.log(`getTipiUtenti - ${err}`);
          return [];
        }
      }
};
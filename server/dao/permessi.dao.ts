import { Collection, MongoClient } from "mongodb";
import errCheck from "../middlewares/errCheck.js";
import { TPermesso, TPermessoReq } from "../types/users.js";

const COLLECTION_NAME = "permessi";

let permessi: Collection<TPermesso>;

export default class PermessiDAO {

    static async injectDB(conn: MongoClient) {
        if(permessi) return;

        try {
          permessi = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
        } catch (err) {
          errCheck(err, `Failed to inject DB ${COLLECTION_NAME}.`);
        }
    }

    static async getPermessi(filters: TPermessoReq = {}) {
        const query: Record<string, unknown> = {};
        Object.entries(filters)
          .filter(([, value]) => value)
          .forEach(([key, value]) => {
            value = value as string;
            switch (key) {
              case "username":
                query[key] = value;
                break;
              case "date": {
                const monthAndYear = value.substring(value.indexOf("-"));
                query[key] = { $regex: new RegExp(monthAndYear) };
                break;
              }
              default:
            }
          });
          console.log(query);
        try {
            const cursor = permessi.find(query, {
              projection: {
                _id: 0,
                username: 1,
                date: 1,
              },
            });
            const displayCursor = cursor.limit(500).skip(0);
            const permessiList = await displayCursor.toArray();
            return permessiList;
        } catch(err) {
            errCheck(err, "getPermessi |");
            return [];
        }
    }

    static async addPermesso(data: TPermesso) {
        try {
            const permesso = await permessi.findOne(data);
            if(permesso) throw Error("Permesso già esistente");

            return await permessi.insertOne(data);
        } catch(err) {
          return errCheck(err, "addPermesso |");
        }
    }

    static async deletePermesso(data: TPermesso) {
        try {
            return await permessi.deleteOne(data);
        } catch(err) {
          return errCheck(err, "removePermesso |");
        }
    }
    
}
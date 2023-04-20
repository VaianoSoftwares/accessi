import { Collection, MongoClient, ObjectId } from "mongodb";
import errCheck from "../utils/errCheck.js";
import { TPermesso, TPermessoReq } from "../types/users.js";

const COLLECTION_NAME = "permessi";

let permessi: Collection<TPermesso>;

export default class PermessiDAO {
  static async injectDB(conn: MongoClient) {
    if (permessi) return;

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
        }
      });
    console.log(query);
    try {
      const cursor = permessi.find(query);
      const displayCursor = cursor.limit(500).skip(0);
      const permessiList = await displayCursor.toArray();
      return permessiList;
    } catch (err) {
      errCheck(err, "getPermessi |");
      return [];
    }
  }

  static async addPermesso(data: TPermesso) {
    try {
      const permesso = await permessi.findOne(data);
      if (permesso) throw Error("Permesso già esistente");

      return await permessi.insertOne(data);
    } catch (err) {
      return errCheck(err, "addPermesso |");
    }
  }

  static async deletePermesso(_id: string | ObjectId) {
    try {
      return await permessi.deleteOne({ _id: new ObjectId(_id) });
    } catch (err) {
      return errCheck(err, "removePermesso |");
    }
  }
}

import { Collection, MongoClient } from "mongodb";
import errCheck from "../utils/errCheck.js";
import { TAssegnaz, TEnums, TPostazione } from "../types/enums.js";
import PostazioniDao from "./postazioni.dao.js";

const COLLECTION_NAME = "enums";

let enums: Collection<TEnums>;

export default class EnumsDAO {
  static async injectDB(conn: MongoClient) {
    if (enums) return;

    try {
      enums = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
    } catch (err) {
      errCheck(err, `DB ${COLLECTION_NAME} injection failed.`);
    }
  }

  static async getEnums() {
    try {
      return await enums.findOne();
    } catch (err) {
      errCheck(err, "getEnums |");
      return null;
    }
  }

  static async getAssegnazioni() {
    try {
      const dbResp = await enums.findOne(
        {},
        {
          projection: {
            _id: 0,
            assegnazione: 1,
          },
        }
      );
      return dbResp?.assegnazione ?? null;
    } catch (err) {
      errCheck(err, "getAssegnazioni |");
      return null;
    }
  }

  static async getClienti() {
    try {
      const dbResp = await enums.findOne(
        {},
        {
          projection: {
            _id: 0,
            cliente: 1,
          },
        }
      );
      return dbResp?.cliente ?? null;
    } catch (err) {
      errCheck(err, "getClienti |");
      return null;
    }
  }

  static async getPostazioni() {
    try {
      const dbResp = await enums.findOne(
        {},
        {
          projection: {
            _id: 0,
            postazione: 1,
          },
        }
      );
      return dbResp?.postazione ?? null;
    } catch (err) {
      errCheck(err, "getPostazioni |");
      return null;
    }
  }

  static async pushAssegnaz(dataToPush: TAssegnaz[] = []) {
    try {
      return await enums.updateOne(
        {},
        { $addToSet: { assegnazione: { $each: dataToPush } } }
      );
    } catch (err) {
      return errCheck(err, "pushAssegnaz |");
    }
  }

  static async pullAssegnaz(dataToPull: TAssegnaz[] = []) {
    try {
      return await enums.updateOne(
        {},
        { $pullAll: { assegnazione: dataToPull } }
      );
    } catch (err) {
      return errCheck(err, "pullAssegnaz |");
    }
  }

  static async addCliente(cliente: string) {
    try {
      const enumsResp = await this.getEnums();
      if (enumsResp!.cliente.includes(cliente)) {
        throw new Error("Cliente già esistente");
      }

      return await enums.updateOne({}, { $push: { cliente } });
    } catch (err) {
      return errCheck(err, "addCliente |");
    }
  }

  static async deleteCliente(cliente: string) {
    try {
      await PostazioniDao.deletePostazioniOfCliente(cliente);
      return await enums.updateOne(
        {},
        { $pull: { cliente, postazione: { cliente } } }
      );
    } catch (err) {
      return errCheck(err, "deleteCliente |");
    }
  }

  static async pushPostazione(postazione: TPostazione) {
    try {
      const enumsResp = await this.getEnums();
      if (!enumsResp!.cliente.includes(postazione.cliente)) {
        throw new Error("Cliente non valido esistente");
      }

      return await enums.updateOne({}, { $push: { postazione } });
    } catch (err) {
      return errCheck(err, "pushPostazione |");
    }
  }

  static async pullPostazione(postazione: TPostazione) {
    try {
      return await enums.updateOne({}, { $pull: { postazione } });
    } catch (err) {
      return errCheck(err, "pullPostazione |");
    }
  }
}

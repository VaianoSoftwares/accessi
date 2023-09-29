import { Collection, MongoClient, ObjectId } from "mongodb";
import {
  ProtocolloAddReq,
  ProtocolloFile,
  ProtocolloFindReq,
} from "../types/protocollo.js";
import errCheck from "../utils/errCheck.js";
import dateFormat from "dateformat";

const COLLECTION_NAME = "protocollo";

let protocollo: Collection<ProtocolloFile>;

export default class ProtocolloDAO {
  static async injectDB(conn: MongoClient) {
    if (protocollo) return;

    try {
      protocollo = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
    } catch (err) {
      errCheck(err, `Failed to inject DB ${COLLECTION_NAME}.`);
    }
  }

  static async getFiles(filter: ProtocolloFindReq = {}) {
    const exprList = Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        const newElem: Record<string, unknown> = {};

        switch (key) {
          case "visibileDa":
            newElem[key] = { $in: value as ObjectId[] };
            break;
          case "dataInizio":
            newElem[key] = { $gte: new Date(value as string | Date) };
          case "dataFine":
            newElem[key] = { $lte: new Date(value as string | Date) };
          default:
            newElem[key] = { $regex: new RegExp(value as string, "i") };
        }

        return newElem;
      });

    const query = { $and: exprList };

    try {
      const cursor = protocollo.find(query);
      const displayCursor = cursor.limit(50).skip(0);
      const filesArray = await displayCursor.toArray();
      return filesArray;
    } catch (err) {
      errCheck(err, "getFiles |");
      return [];
    }
  }

  static async addFile(data: ProtocolloAddReq) {
    const protocolloDoc = {
      ...data,
      descrizione: data.descrizione ? data.descrizione : "",
      data: dateFormat.default(new Date(), "yyyy-mm-dd"),
    } satisfies ProtocolloFile;

    try {
      return await protocollo.insertOne(protocolloDoc);
    } catch (err) {
      return errCheck(err, "addFile |");
    }
  }

  static async editFile() {}

  static async deleteFile(id: ObjectId | string) {
    try {
      return await protocollo.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return errCheck(err, "deleteFile |");
    }
  }
}

import { Collection, MongoClient } from "mongodb";
import errCheck from "../utils/errCheck.js";
import { TAssegnaz, TEnums } from "../types/enums.js";

const COLLECTION_NAME = "enums";

let enums: Collection<TEnums>;

export default class EnumsDAO {
    static async injectDB(conn: MongoClient) {
        if(enums) return;

        try {
            enums = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
        } catch(err) {
            errCheck(err, `DB ${COLLECTION_NAME} injection failed.`);
        }
    }

    static async getEnums() {
        try {
            return await enums.findOne();
        } catch(err) {
            errCheck(err, "getEnums |");
            return null;
        }
    }

    static async pushAssegnaz(dataToPush: TAssegnaz[] = []) {
        try {
            return await enums.updateOne(
              {},
              { $addToSet: { assegnazione: { $each: dataToPush } } }
            );
        } catch(err) {
            return errCheck(err, "pushAssegnaz |");
        }
    }

    static async pullAssegnaz(dataToPull: TAssegnaz[] = []) {
        try {
            return await enums.updateOne(
              {},
              { $pullAll: { assegnazione: dataToPull } }
            );
        } catch(err) {
            return errCheck(err, "pullAssegnaz |");
        }
    }
}
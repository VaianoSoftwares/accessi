import { Collection, MongoClient, ObjectId } from "mongodb";
import errCheck from "../middlewares/errCheck.js";
import { isDocUpdKey, TDocumento, TDocumentoReq, TDocUpdReq } from "../types/documenti.js";

const COLLECTION_NAME = "documenti";

let docs: Collection<TDocumento>;

export default class DocumentiDAO {

    static async injectDB(conn: MongoClient) {
        if (docs) return;
    
        try {
          docs = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
        } catch (err) {
          errCheck(err, `Failed to inject DB ${COLLECTION_NAME}.`);
        }
    }

    static async getDocumenti(filter: TDocumentoReq = {}) {
      const docFilter: Record<string, unknown>[] = [];

      Object.entries(filter).forEach((([key, value]) => {
        const valueRegex: Record<string, unknown> = {};
        valueRegex[key] = { $regex: new RegExp(value as string, "i") };
        docFilter.push(valueRegex);
      }));

      if(docFilter.length === 0) return [];

      const query = { $and: docFilter };

      try {
        const cursor = docs.find(query, { projection: { _id: 0 } });
        const displayCursor = cursor.limit(500).skip(0);
        const docsList = await displayCursor.toArray();
        return docsList;
      } catch(err) {
        errCheck(err, "getDocumenti |");
        return [];
      }

    }

    static async addDocumento(data: TDocumento) {
      const { codice } = data;

      try {
        const existsDoc = await docs.findOne({ codice });
        if(existsDoc)
          throw new Error(`Documento ${codice} già esistente.`);

        return await docs.insertOne(data);
      } catch(err) {
        return errCheck(err, "addDocumento |");
      }
    }

    static async updateDocumento(data: TDocUpdReq) {
      const paramsToUpdate: Record<string, unknown> = {};
      Object.entries(data)
        .filter(([key, value]) => value && isDocUpdKey(key))
        .forEach(
          ([key, value]) =>
            (paramsToUpdate[key] = (value as string).toUpperCase())
        );
      
      const { codice } = data;

      try {
        const existsDoc = await docs.findOne({ codice });
        if(!existsDoc)
          throw new Error(`Documento ${codice} non esistente.`);

        const docId = new ObjectId(existsDoc._id);

        const updateResponse = await docs.updateOne(
          { _id: docId },
          { $set: paramsToUpdate }
        );

        if(updateResponse.modifiedCount === 0)
          throw new Error("Nessun documento è stato modificato.");

        return { updatedId: docId };
      } catch(err) {
        return errCheck(err, "updateDocumento |");
      }
    }

    static async deleteDocumento(codice: string) {
      try {
        const deleteResponse = await docs.deleteOne({ codice });
        return deleteResponse;
      } catch(err) {
        return errCheck(err, "deleteDocumento |");
      }
    }

    static async getDocById(id: string | ObjectId) {
      try {
        const doc = docs.findOne(
          { _id: { $eq: new ObjectId(id) } },
          { projection: { _id: 0 } },
        );
        return doc;
      } catch(err) {
        return errCheck(err, "getDocById |");
      }
    }

}
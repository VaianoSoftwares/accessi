import { ObjectId } from "mongodb";

let docs;

export default class DocumentiDAO {

    static async injectDB(conn) {
        if (docs) return;
    
        try {
          docs = await conn.db(process.env.DB_NAME).collection("documenti");
        } catch (err) {
          console.log(`Failed to inject DB. ${err}`);
        }
    }

    static async getDocumenti(filter = {}) {
      const docFilter = [];

      Object.entries(filter).forEach((([key, value]) => {
        let valueRegex = {};
        valueRegex[key] = { $regex: new RegExp(value, "i") };
        docFilter.append(valueRegex);
      }));

      const query = docFilter.length > 0 ? { $and: docFilter } : null;

      try {
        const cursor = await docs.find(query, { projection: { _id: 0 } });
        const displayCursor = cursor.limit(500).skip(0);
        const docsList = await displayCursor.toArray();
        return docsList;
      } catch(err) {
        console.error(`getDocumenti - ${err}`);
        return [];
      }

    }

    static async addDocumento(data) {
      const { codice } = data;

      try {
        const existsDoc = await docs.findOne({ codice });
        if(existsDoc)
          throw new Error(`Documento ${codice} già esistente.`);

        return await docs.insertOne(data);
      } catch(err) {
        console.error(`addDocumento - ${err}`);
        return { error: err };
      }
    }

    static async updateDocumento(data) {
      let paramsToUpdate = {};
      Object.entries(data)
        .filter(([key, value]) => value && key !== "codice")
        .forEach(([key, value]) => paramsToUpdate[key] = value.toUpperCase());
      
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

        updateResponse.updatedId = docId;

        return updateResponse;
      } catch(err) {
        console.error(`updateDocumento - ${err}`);
        return { error: err };
      }
    }

    static async deleteDocumento(codice) {
      try {
        const deleteResponse = await docs.deleteOne({ codice });
        return deleteResponse;
      } catch(err) {
        console.error(`deleteDocumento - ${err}`);
        return { error: err };
      }
    }

    static async getDocById(id) {
      try {
        const doc = await docs.findOne(
          { _id: { $eq: new ObjectId(id) } },
          { _id: 0 }
        );
        return doc;
      } catch(err) {
        console.error("getDocById | ", err);
        return { error: err };
      }
    }

}
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

      const query = { $and: docFilter };

      try {
        const cursor = await docs.find(query);
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
      
      if(Object.keys(paramsToUpdate).length === 0) {
        console.log("updateDocumento - No parameters to update");
        return {};
      }
      
      const { codice } = data;

      try {
        const existsDoc = await docs.findOne({ codice });
        if(!existsDoc)
          throw new Error(`Documento ${codice} non esistente.`);

        const docId = existsDoc._id;

        const updateResponse = await docs.insertOne(
          { _id: docId },
          { $set: paramsToUpdate }
        );

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

}
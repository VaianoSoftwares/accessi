import { Collection, Filter, MongoClient, ObjectId } from "mongodb";
import { TPostazione } from "../types/enums.js";
import errCheck from "../utils/errCheck.js";
import EnumsDAO from "./enums.dao.js";

type TFindPostazioniFilter = {
  _id?: (ObjectId | string)[];
  cliente?: string[];
};

type TUpdatePostazioni = {
  _id: ObjectId | string;
  cliente?: string;
  name?: string;
};

const COLLECTION_NAME = "postazioni";

let postazioni: Collection<TPostazione>;

export default class PostazioniDao {
  static async injectDB(conn: MongoClient) {
    if (postazioni) return;

    try {
      postazioni = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
    } catch (err) {
      errCheck(err, `DB ${COLLECTION_NAME} injection failed.`);
    }
  }

  static async getPostazioni(filters: TFindPostazioniFilter = {}) {
    const exprList = Object.entries(filters)
      .filter(([, value]) => value && value.length > 0)
      .map(([key, value]) => {
        const mappedElement: Record<string, unknown> = {};
        mappedElement[key] =
          key === "_id"
            ? { $in: value.map((str) => new ObjectId(str)) }
            : { $in: value };
        return mappedElement;
      });

    const query: Filter<TPostazione> =
      exprList.length > 0 ? { $or: exprList } : {};

    try {
      const cursor = postazioni.find(query);
      const postazioniFound = await cursor.toArray();
      return postazioniFound;
    } catch (err) {
      errCheck(err, "getPostazioni |");
      return [];
    }
  }

  static async addPostazione(postazione: TPostazione) {
    try {
      const clienti = await EnumsDAO.getClienti();

      if (!clienti) throw new Error("Impossibile reperire clienti");
      else if (!clienti.includes(postazione.cliente))
        throw new Error("Cliente non valido");

      return await postazioni.insertOne(postazione);
    } catch (err) {
      return errCheck(err, "addPostazione |");
    }
  }

  static async updatePostazione(data: TUpdatePostazioni) {
    const dataToUpd: Partial<TPostazione> = Object.entries(data)
      .filter(([key]) => key !== "_id")
      .reduce((prev, [key, value]) => ({ ...prev, [key]: value }), {});

    try {
      if (dataToUpd.cliente) {
        const clienti = await EnumsDAO.getClienti();
        if (!clienti) throw new Error("Impossibile reperire clienti");
        else if (!clienti.includes(dataToUpd.cliente))
          throw new Error("Cliente non valido");
      }

      return await postazioni.updateOne(
        { _id: new ObjectId(data._id) },
        dataToUpd
      );
    } catch (err) {
      return errCheck(err, "deletePostazione |");
    }
  }

  static async deletePostazione(id: string | ObjectId) {
    try {
      return await postazioni.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return errCheck(err, "deletePostazione |");
    }
  }

  static async deletePostazioniOfCliente(cliente: string) {
    try {
      return await postazioni.deleteMany({ cliente });
    } catch (err) {
      return errCheck(err, "deletePostazioniOfCliente |");
    }
  }
}

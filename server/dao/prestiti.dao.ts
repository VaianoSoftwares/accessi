import { Collection, Filter, MongoClient, ObjectId } from "mongodb";
import errCheck from "../utils/errCheck.js";
import { TBadge, TChiave } from "../types/badges.js";
import { TArchivioChiave } from "../types/prestiti.js";
import BadgesDAO from "./badges.dao.js";

const COLLECTION_NAME = "archivio-chiavi";

let prestiti: Collection<TArchivioChiave>;

export default class PrestitiDAO {
  static async injectDB(conn: MongoClient) {
    if (prestiti) return;

    try {
      prestiti = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
    } catch (err) {
      errCheck(err, `Failed to inject DB ${COLLECTION_NAME}.`);
    }
  }

  static async getArchivioChiave(filters: Record<string, unknown> = {}) {
    const archivioFilter: Record<string, unknown>[] = [
      { "data.reso": { $ne: null } },
    ];

    if (filters.dataInizio && filters.dataFine) {
      const dateFilter = {
        "data.prestito": {
          $gte: new Date(new Date(filters.dataInizio as string).toISOString()),
          $lte: new Date(new Date(filters.dataFine as string).toISOString()),
        },
      };
      archivioFilter.push(dateFilter);
    }

    Object.entries(filters)
      .filter(([key, value]) => value && !key.includes("data"))
      .forEach(([key, value]) => {
        const filter: Record<string, unknown> = {};
        filter[key] = { $regex: new RegExp(value as string, "i") };
        archivioFilter.push(filter);
      });

    const query = { $and: archivioFilter };
    console.log("getArchivioChiave | query: ", query);

    try {
      const cursor = prestiti.find(query, {
        projection: {
          _id: 0,
          nominativo: "$nominativo.barcode",
          nome: "$nominativo.nome",
          cognome: "$nominativo.cognome",
          chiave: "$chiave.barcode",
          descrizione: "$chiave.descrizione",
          cliente: 1,
          postazione: 1,
          ip: 1,
          prestito: "$data.prestito",
          reso: "$data.reso",
        },
      });
      const displayCursor = cursor.limit(500).skip(0);
      const archivioArr = await displayCursor.toArray();
      return archivioArr;
    } catch (err) {
      errCheck(err, "getArchivioChiave |");
      return [];
    }
  }

  static async getInPrestito(cliente?: string, postazione?: string) {
    const arrFilters: object[] = [{ "data.uscita": { $eq: null } }];

    if (cliente) arrFilters.push({ cliente });
    if (postazione) arrFilters.push({ postazione });

    const query: Filter<unknown> = {
      $and: arrFilters,
    };

    try {
      const cursor = prestiti.find(query, {
        projection: {
          _id: 0,
          id: { $toString: "$_id" },
          nominativo: "$nominativo.barcode",
          nome: "$nominativo.nome",
          cognome: "$nominativo.cognome",
          chiave: "$chiave.barcode",
          descrizione: "$chiave.descrizione",
          prestito: "$data.prestito",
        },
      });
      const displayCursor = cursor.sort({ _id: -1 }).limit(500).skip(0);
      const archivioList = await displayCursor.toArray();
      return archivioList;
    } catch (err) {
      errCheck(err, "getInPrestito |");
      return [];
    }
  }

  static async getInPrestitoBy(key: string, value: string | ObjectId) {
    try {
      const filter: Record<string, unknown> = {};
      filter[key] =
        key === "_id" ? { $eq: new ObjectId(value) } : { $eq: value };

      return await prestiti.findOne(
        {
          $and: [filter, { "data.reso": { $eq: null } }],
        },
        {
          projection: {
            _id: 0,
            id: { $toString: "$_id" },
            nominativo: "$nominativo.barcode",
            nome: "$nominativo.nome",
            cognome: "$nominativo.cognome",
            chiave: "$chiave.barcode",
            descrizione: "$chiave.descrizione",
            prestito: "$data.prestito",
          },
        }
      );
    } catch (err) {
      errCheck(err, "getInPrestitoBy |");
      return null;
    }
  }

  static async prestitoChiavi(
    barcodes: string[],
    cliente: string,
    postazione: string,
    ip: string
  ) {
    try {
      const { chiavi, nominativo } = await this.#getChiavi(barcodes);
      if (chiavi.length === 0) throw new Error("Nessuna chiave selezionata.");

      const prestate = new Array<TArchivioChiave>(),
        rese = new Array<string>();

      for (const chiave of chiavi) {
        const inPrestito = await prestiti.findOne(
          {
            "data.reso": { $eq: null },
            chiave,
          },
          { projection: { _id: 1 } }
        );

        if (inPrestito) {
          const updResponse = await this.#rendiChiave(inPrestito._id);
          if ("error" in updResponse) throw new Error(updResponse.error);
          else if (updResponse.modifiedCount === 0)
            throw new Error(`Impossibile rendere chiave ${chiave}`);

          rese.push(inPrestito._id.toString());
        } else if (nominativo) {
          const addResponse = await this.#prestaChiave(
            nominativo,
            chiave,
            cliente,
            postazione,
            ip
          );
          if ("error" in addResponse) throw new Error(addResponse.error);

          const added = await this.getInPrestitoBy(
            "_id",
            addResponse.insertedId
          );
          if (!added) throw new Error(`Impossibile prestare chiave ${chiave}`);

          prestate.push(added);
        }
      }

      return {
        rese,
        prestate,
      };
    } catch (err) {
      return errCheck(err, "prestitoChiave |");
    }
  }

  static async #getChiavi(barcodes: string[]) {
    let nominativo: TBadge | null = null;

    const badges = await Promise.all(
      Array.from(new Set(barcodes)).map(
        async (barcode) =>
          await BadgesDAO.findBadgeByBarcode(barcode.toUpperCase())
      )
    );

    const chiavi = badges
      .filter((badge) => {
        if (!badge) return false;

        if (badge.tipo === "CHIAVE") return true;
        else if (badge.tipo === "BADGE") nominativo = badge as TBadge;

        return false;
      })
      .map((badge) => badge! as TChiave);

    return { chiavi, nominativo };
  }

  static async #prestaChiave(
    nominativo: TBadge,
    chiave: TChiave,
    cliente: string,
    postazione: string,
    ip: string
  ) {
    const archivioDoc: TArchivioChiave = {
      nominativo,
      chiave,
      data: {
        prestito: new Date(new Date().toISOString()),
        reso: null,
      },
      cliente,
      postazione,
      ip,
    };

    try {
      return await prestiti.insertOne(archivioDoc);
    } catch (err) {
      return errCheck(err, "prestaChiave |");
    }
  }

  static async #rendiChiave(id: ObjectId) {
    try {
      return await prestiti.updateOne(
        { _id: id },
        {
          $set: {
            "data.reso": new Date(new Date().toISOString()),
          },
        }
      );
    } catch (err) {
      return errCheck(err, "rendiChiave |");
    }
  }
}

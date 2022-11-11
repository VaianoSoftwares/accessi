import dateFormat from "dateformat";
import { Collection, Filter, MongoClient } from "mongodb";
import errCheck from "../middlewares/errCheck.js";
import Badge, {
  TBadge,
  TBadgeAddReq,
  TBadgeFindReq,
  TBadgeUpdReq,
  TChiave,
  TGenericBadge,
  TProvvisorio,
  TVeicolo,
} from "../types/badges.js";

const COLLECTION_NAME = "badges";

let badges: Collection<TGenericBadge>;

export default class BadgesDAO {
  static async injectDB(conn: MongoClient) {
    if (badges) {
      return;
    }

    try {
      badges = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
    } catch (err) {
      errCheck(err, `DB ${COLLECTION_NAME} injection failed.`);
    }
  }

  static async getBadges(filters: TBadgeFindReq = {}) {
    const exprList = Object.entries(filters)
      .filter(
        ([key, value]) =>
          value && key !== "scadenza" && !Badge.isTargheKey(key) && Badge.isBadgeKey(key)
      )
      .map(([key, value]) => {
        const fieldName = Badge.isNomKey(key) ? `nominativo.${key}` : key;

        const newElem: Record<string, unknown> = {};
        newElem[fieldName] = { $regex: new RegExp(value as string, "i") };
        return newElem;
      });

    const targhe = Object.entries(filters)
      .filter(([key, value]) => value && Badge.isTargheKey(key))
      .map(([, value]) => value);

    if (targhe.length > 0) {
      exprList.push({ "nominativo.targhe": { $all: targhe } });
    }

    if(exprList.length === 0) return [];
    
    const query: Filter<unknown> = { $and: exprList };
    console.log(query);

    try {
      const cursor = badges.find(query);
      const displayCursor = cursor.limit(50).skip(0);
      const badgesList = await displayCursor.toArray();
      console.log(badgesList);
      return badgesList;
    } catch (err) {
      errCheck(err, "getBadges |");
      return [];
    }
  }

  static async findBadgeByBarcode(barcode: string) {
    try {
      return await badges.findOne({ barcode });
    } catch (err) {
      errCheck(err, "findBadgeByBarcode |");
      return null;
    }
  }

  static #getBadgeDoc(data: TBadgeAddReq) {
    const badgeDoc: TBadge = {
      barcode: data?.barcode?.toUpperCase() || "",
      descrizione: data?.descrizione?.toUpperCase() || "",
      tipo: "BADGE",
      assegnazione: data?.assegnazione?.toUpperCase() || "",
      ubicazione: data?.ubicazione?.toUpperCase() || "",
      stato: Badge.toBadgeStato(data?.stato?.toUpperCase()),
      nominativo: {
        nome: data?.nome?.toUpperCase() || "",
        cognome: data?.cognome?.toUpperCase() || "",
        ditta: data?.ditta?.toUpperCase() || "",
        telefono: data?.telefono?.toUpperCase() || "",
        tdoc: Badge.toTDoc(data?.tdoc?.toUpperCase()),
        ndoc: data?.ndoc?.toUpperCase() || "",
        scadenza: !data.scadenza
          ? ""
          : dateFormat(new Date(data.scadenza), "yyyy-mm-dd"),
        targhe: null,
      },
    };

    return badgeDoc;
  }

  static #getVeicoloDoc(data: TBadgeAddReq) {
    const veicoloDoc: TVeicolo = {
      barcode: data.barcode.toUpperCase(),
      descrizione: data?.descrizione?.toUpperCase() || "",
      tipo: "VEICOLO",
      assegnazione: data?.assegnazione?.toUpperCase() || "",
      ubicazione: data?.ubicazione?.toUpperCase() || "",
      stato: Badge.toBadgeStato(data?.stato?.toUpperCase()),
      nominativo: {
        nome: data?.nome?.toUpperCase() || "",
        cognome: data?.cognome?.toUpperCase() || "",
        ditta: data?.ditta?.toUpperCase() || "",
        telefono: data?.telefono?.toUpperCase() || "",
        tdoc: Badge.toTDoc(data?.tdoc?.toUpperCase()),
        ndoc: data?.ndoc?.toUpperCase() || "",
        scadenza: "",
        targhe: {
          1: data?.targa1?.toUpperCase() || "",
          2: data?.targa2?.toUpperCase() || "",
          3: data?.targa3?.toUpperCase() || "",
          4: data?.targa4?.toUpperCase() || ""
        }
      }
    };

    return veicoloDoc;
  }

  static #getChiaveDoc(data: TBadgeAddReq) {
    const chiaveDoc: TChiave = {
      barcode: data.barcode.toUpperCase(),
      descrizione: data?.descrizione?.toUpperCase() || "",
      tipo: "CHIAVE",
      assegnazione: data?.assegnazione?.toUpperCase() || "",
      ubicazione: data?.ubicazione?.toUpperCase() || "",
      stato: Badge.toBadgeStato(data?.stato?.toUpperCase()),
      nominativo: {
        nome: data?.nome?.toUpperCase() || "",
        cognome: data?.cognome?.toUpperCase() || "",
        ditta: data?.ditta?.toUpperCase() || "",
        telefono: data?.telefono?.toUpperCase() || "",
        tdoc: Badge.toTDoc(data?.tdoc?.toUpperCase()),
        ndoc: data?.ndoc?.toUpperCase() || "",
        scadenza: "",
        targhe: null
      }
    };

    return chiaveDoc;
  }

  static #getProvvisorioDoc(data: TBadgeAddReq) {
    const provDoc: TProvvisorio = {
      barcode: data.barcode.toUpperCase(),
      descrizione: data?.descrizione?.toUpperCase() || "",
      tipo: "BADGE",
      assegnazione: data?.assegnazione?.toUpperCase() || "",
      ubicazione: data?.ubicazione?.toUpperCase() || "",
      stato: Badge.toBadgeStato(data?.stato?.toUpperCase()),
      nominativo: null
    };

    return provDoc;
  }

  static #isBadgeNom(data: TBadgeAddReq) {
    return (
      Object.entries(data).filter(
        ([key, value]) => value && Badge.isNomKey(key)
      ).length > 0
    );
  }

  static async addBadge(data: TBadgeAddReq) {
    try {
      const badge = await this.findBadgeByBarcode(data.barcode);
      if (badge) {
        throw new Error(`Barcode ${data.barcode} già esistente.`);
      }

      const isNom = this.#isBadgeNom(data);

      const badgeDoc = !isNom
        ? this.#getProvvisorioDoc(data)
        : !data.tipo || data.tipo === "BADGE"
        ? this.#getBadgeDoc(data)
        : data.tipo === "VEICOLO"
        ? this.#getVeicoloDoc(data)
        : data.tipo === "CHIAVE"
        ? this.#getChiaveDoc(data)
        : null;

      if(!badgeDoc) {
        throw new Error(`Tipo badge ${data.tipo} sconosciuto.`);
      }

      return await badges.insertOne(badgeDoc);
    } catch (err) {
      return errCheck(err, "addBadge |");
    }
  }

  static async updateBadge(data: TBadgeUpdReq) {
    const { barcode } = data;
    const paramsToUpdate: Record<string, unknown> = {};

    try {
      const badge = await this.findBadgeByBarcode(barcode);
      if (!badge) {
        throw new Error(`Barcode ${barcode} non esistente.`);
      }

      Object.entries(data)
        .filter(([key, value]) => value && key !== "barcode" && Badge.isBadgeKey(key))
        .forEach(([key, value]) => {
          value = value as string;

          if (key === "scadenza")
            paramsToUpdate[`nominativo.${key}`] = dateFormat(
              new Date(value),
              "yyyy-mm-dd"
            );
          else if (Badge.isTargheKey(key))
            paramsToUpdate[`nominativo.targhe.${key.charAt(key.length - 1)}`] =
              value.toUpperCase();
          else if (Badge.isNomKey(key))
            paramsToUpdate[`nominativo.${key}`] = value.toUpperCase();
          else paramsToUpdate[key] = value.toUpperCase();
        });

      const badgeId = badge._id;

      const updateResponse = await badges.updateOne(
        { _id: badgeId },
        { $set: paramsToUpdate }
      );
      return updateResponse;
    } catch (err) {
      return errCheck(err, "updateBadge |");
    }
  }

  static async deleteBadge(barcode: string) {
    try {
      return await badges.deleteOne({ 
        barcode: barcode.toUpperCase() 
      });
    } catch (err) {
      return errCheck(err, "deleteBadge |");
    }
  }

  /*
  static async getReparti() {
    try {
      const reparti = await badges.distinct("reparto");
      return reparti;
    } catch (err) {
      console.log(`getReparti - ${err}`);
      return [];
    }
  }

  static async getTipiDoc() {
    try {
      const tipiDoc = await badges.distinct("nominativo.documento.tipo");
      return tipiDoc;
    } catch (err) {
      console.log(`getTipiDoc - ${err}`);
      return [];
    }
  }
  */
}
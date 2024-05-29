import { Nominativo } from "../types/badges.js";
import {
  FindNominativiFilter,
  InsertNominativoData,
  UpdateNominativoData,
} from "../utils/validation.js";
import * as db from "./index.js";

const tableName = "nominativi";

export default class NominativiDB {
  public static async getNominativi(filter?: FindNominativiFilter) {
    const { queryText, queryValues } = db.getSelectRowQuery(
      "nominativi_w_docs",
      {
        selections: filter,
      }
    );
    return await db.query(queryText, queryValues);
  }

  public static async insertNominativo(data: InsertNominativoData) {
    return await db.insertRow<Nominativo>(tableName, data);
  }

  public static async updateNominativo(data: UpdateNominativoData) {
    return await db.updateRows<Nominativo>(tableName, data.updateData, {
      codice: data.codice,
    });
  }

  public static async deleteNominativo(codice: string) {
    return await db.deleteRows<Nominativo>(tableName, { codice });
  }

  public static getAssegnazioni() {
    return db.query<{ value: string }>("SELECT * FROM assegnazioni");
  }

  public static readonly getNominativoByCodiceQueryText =
    "SELECT * FROM nominativi WHERE codice = $1";

  public static async getNominativoByCodice(codice: string) {
    return await db.query<Nominativo>(
      NominativiDB.getNominativoByCodiceQueryText,
      [codice]
    );
  }
}

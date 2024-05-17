import { Veicolo, VeicoloNominativo } from "../types/badges.js";
import {
  FindVeicoliFilter,
  InsertVeicoloData,
  UpdateVeicoloData,
} from "../utils/validation.js";
import * as db from "./index.js";

const tableName = "veicoli";

export default class VeicoliDB {
  public static async getVeicoli(filter?: FindVeicoliFilter) {
    const { queryText, queryValues } = db.getSelectRowQuery(tableName, {
      selections: filter,
    });
    return await db.query(queryText, queryValues);
  }

  public static async insertVeicolo(data: InsertVeicoloData) {
    return await db.insertRow("veicoli", data);
  }

  public static async updateVeicolo(data: UpdateVeicoloData) {
    return await db.updateRows("veicoli", data.updateData, {
      codice: data.codice,
    });
  }

  public static async deleteVeicolo(codice: string) {
    return await db.deleteRows("veicoli", { codice });
  }

  public static async getTVeicoli() {
    return await db.query<{ value: string }>("SELECT * FROM tveicoli");
  }

  public static async getVeicoloByTarga(targa: string) {
    return await db.query<Veicolo>("SELECT * FROM veicoli WHERE targa = $1", [
      targa,
    ]);
  }

  public static async getVeicoloNominativoByTarga(targa: string) {
    return await db.query<VeicoloNominativo>(
      "SELECT *, ba.codice AS badge_cod, ve.codice AS veh_cod FROM veicoli AS ve JOIN people AS pe ON ve.proprietario = ba.codice WHERE targa = $1",
      [targa]
    );
  }
}

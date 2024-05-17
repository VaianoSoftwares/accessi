import * as db from "./index.js";
import {
  FindChiaviFilter,
  InsertChiaveData,
  UpdateChiaveData,
} from "../utils/validation.js";
import { Chiave, ChiaveNominativo } from "../types/badges.js";

const tableName = "chiavi";

export default class ChiaviDB {
  public static async getChiavi(filter?: FindChiaviFilter) {
    const { queryText, queryValues } = db.getSelectRowQuery(tableName, {
      selections: filter,
    });
    return await db.query(queryText, queryValues);
  }

  public static async insertChiave(data: InsertChiaveData) {
    return await db.insertRow(tableName, data);
  }

  public static async updateChiave(data: UpdateChiaveData) {
    return await db.updateRows(tableName, data.updateData, {
      codice: data.codice,
    });
  }

  public static async deleteChiave(codice: string) {
    return await db.deleteRows(tableName, { codice });
  }

  public static async getEdifici() {
    return await db.query<{ value: string }>("SELECT * FROM edifici");
  }

  public static async getChiaveByCodice(codice: string) {
    return await db.query<Chiave>("SELECT * FROM chiavi WHERE codice = $1", [
      codice,
    ]);
  }

  public static async getChiaveNominativoByCodice(codice: string) {
    return await db.query<ChiaveNominativo>(
      "SELECT * FROM chiavi JOIN people ON proprietario = id WHERE codice = $1",
      [codice]
    );
  }
}

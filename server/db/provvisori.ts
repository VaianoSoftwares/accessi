import * as db from "./index.js";
import {
  FindProvvisoriFilter,
  InsertProvvisorioData,
  UpdateProvvisorioData,
} from "../utils/validation.js";
import { Provvisorio } from "../types/badges.js";

const tableName = "provvisori";

export default class ProvvisoriDB {
  public static async getProvvisori(filter?: FindProvvisoriFilter) {
    const { queryText, queryValues } = db.getSelectRowQuery(tableName, {
      selections: filter,
    });
    return await db.query(queryText, queryValues);
  }

  public static async insertProvvisorio(data: InsertProvvisorioData) {
    return await db.insertRow(tableName, data);
  }

  public static async updateProvvisorio(data: UpdateProvvisorioData) {
    return await db.updateRows(tableName, data.updateData, {
      codice: data.codice,
    });
  }

  public static async deleteProvvisorio(codice: string) {
    return await db.deleteRows(tableName, { codice });
  }

  public static async getProvvisorioByCodice(codice: string) {
    return await db.query<Provvisorio>(
      "SELECT * FROM provvisori WHERE codice = $1",
      [codice]
    );
  }
}

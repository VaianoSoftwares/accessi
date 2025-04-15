import * as db from "./index.js";
import {
  FindMazziFilter,
  InsertMazzoData,
  UpdateMazzoData,
} from "../utils/validation.js";
import { BaseError } from "../types/errors.js";

const tableName = "mazzi_chiavi";

export default class MazziChiaviDB {
  public static async getMazzi(filter?: FindMazziFilter) {
    const { queryText, queryValues } = db.getSelectRowQuery(tableName, {
      selections: filter,
    });
    return await db.query(queryText, queryValues);
  }

  public static async insertMazzo(data: InsertMazzoData) {
    return await db.insertRow(tableName, data);
  }

  public static async updateMazzo(data: UpdateMazzoData) {
    return await db.updateRows(tableName, data.updateData, {
      codice: data.codice,
    });
  }

  public static async deleteMazzo(codice: string) {
    return await db.deleteRows(tableName, { codice });
  }

  public static async getMazziWithKeyCounter(filter?: FindMazziFilter) {
    const { queryText, queryValues } = db.getSelectRowQuery(
      "mazzi_w_key_count",
      {
        selections: filter,
      }
    );
    return await db.query(queryText, queryValues);
  }

  public static async getChiaviFromMazziCodes(codes: string[]) {
    if (codes.length <= 0) {
      throw new BaseError("No mazzi codes provided", { status: 400 });
    }

    let i = 1;
    const queryFilter = codes.map((_) => `mazzo = $${i++}`).join(" OR ");
    const queryPrefix = "SELECT codice FROM chiavi";
    const queryText = [queryPrefix, queryFilter].join(" WHERE ");

    const dbResult = await db.query<{ codice: string }>(queryText, codes);
    return dbResult.rows.map((row) => row.codice);
  }

  public static async getChiaviNotInMazzo(cliente?: string) {
    let queryText = "SELECT codice FROM chiavi WHERE mazzo IS NULL";
    let queryValues: string[] = [];
    if (cliente) {
      queryText = queryText.concat(" AND cliente = $1");
      queryValues.push(cliente);
    }

    const dbResult = await db.query<{ codice: string }>(queryText, queryValues);
    return dbResult.rows.map((row) => row.codice);
  }
}

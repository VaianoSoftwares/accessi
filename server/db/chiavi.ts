import * as db from "./index.js";
import {
  FindChiaviFilter,
  InsertChiaveData,
  UpdateChiaveData,
} from "../utils/validation.js";
import { Chiave, ChiaveNominativo } from "../types/chiavi.js";

export async function getChiavi(filter?: FindChiaviFilter) {
  const prefixText = "SELECT * FROM chiavi";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value], i) =>
        typeof value === "string" ? `${key} LIKE $${i + 1}` : `${key}=$${i + 1}`
      )
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, "WHERE", filterText].join(" ")
    : prefixText;
  const queryValues =
    filter &&
    Object.values(filter)
      .filter((value) => value)
      .map((value) => (typeof value !== "string" ? value : `%${value}%`))
      .flat();

  return await db.query(queryText, queryValues);
}

export async function insertChiave(data: InsertChiaveData) {
  return await db.insertRow("chiavi", data);
}

export async function updateChiave(data: UpdateChiaveData) {
  return await db.updateRows("chiavi", data.updateData, {
    codice: data.codice,
  });
}

export async function deleteChiave(codice: string) {
  return await db.deleteRows("chiavi", { codice });
}

export async function getChiaveByCodice(codice: string) {
  return await db.query<Chiave>("SELECT * FROM chiavi WHERE codice = $1", [
    codice,
  ]);
}

export async function getChiaveNominativoByCodice(codice: string) {
  return await db.query<ChiaveNominativo>(
    "SELECT * FROM chiavi JOIN people ON proprietario = id WHERE codice = $1",
    [codice]
  );
}

import { Veicolo, VeicoloNominativo } from "../types/veicoli.js";
import {
  FindVeicoliFilter,
  InsertVeicoloData,
  UpdateVeicoloData,
} from "../utils/validation.js";
import * as db from "./index.js";

export async function getVeicoli(filter?: FindVeicoliFilter) {
  const prefixText = "SELECT * FROM veicoli";
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

export async function insertVeicolo(data: InsertVeicoloData) {
  return await db.insertRow("veicoli", data);
}

export async function updateVeicolo(data: UpdateVeicoloData) {
  return await db.updateRows("veicoli", data.updateData, { id: data.id });
}

export async function deleteVeicolo(id: number) {
  return await db.deleteRows("veicoli", { id });
}

export async function getTVeicoli() {
  return await db.query<{ value: string }>("SELECT * FROM tveicoli");
}

export async function getVeicoloByTarga(targa: string) {
  return await db.query<Veicolo>("SELECT * FROM veicoli WHERE targa = $1", [
    targa,
  ]);
}

export async function getVeicoloNominativoByTarga(targa: string) {
  return await db.query<VeicoloNominativo>(
    "SELECT *, pe.id AS person_id, ve.id AS vehicle_id FROM veicoli AS ve JOIN people AS pe ON ve.proprietario = pe.id WHERE targa = $1",
    [targa]
  );
}

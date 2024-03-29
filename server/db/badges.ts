import * as db from "./index.js";
import { Chiave, Nominativo, Provvisorio, Veicolo } from "../types/badges.js";
import {
  FindBadgesFilter,
  InsertChiaveData,
  InsertNominativoData,
  InsertProvvisorioData,
  InsertVeicoloData,
  UpdateChiaveData,
  UpdateNominativoData,
  UpdateProvvisorioData,
  UpdateVeicoloData,
} from "../utils/validation.js";

export async function getBadges(filter?: FindBadgesFilter) {
  const prefixText = "SELECT * FROM all_badges";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value], i) => {
        switch (key) {
          case "scadenza":
            return `scadenza <= ${i + 1}`;
          default:
            return typeof value === "string"
              ? `${key} LIKE $${i + 1}`
              : `${key}=$${i + 1}`;
        }
      })
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, "WHERE", filterText, "ORDER BY codice"].join(" ")
    : [prefixText, "ORDER BY codice"].join(" ");
  const queryValues =
    filter &&
    Object.values(filter)
      .filter((value) => value)
      .map((value) => (typeof value !== "string" ? value : `%${value}%`))
      .flat();

  return await db.query(queryText, queryValues);
}

export function insertProvvisorio(data: InsertProvvisorioData) {
  return db.insertRow<Provvisorio>("provvisori", data);
}

export function updateProvvisorio(data: UpdateProvvisorioData) {
  return db.updateRows<Provvisorio>("provvisori", data.updateData, {
    codice: data.codice,
  });
}

export function deleteProvvisorio(codice: string) {
  return db.deleteRows<Provvisorio>("provvisori", { codice });
}

export function insertNominativo(data: InsertNominativoData) {
  return db.insertRow<Nominativo>("nominativi", data);
}

export function updateNominativo(data: UpdateNominativoData) {
  return db.updateRows<Nominativo>("nominativi", data.updateData, {
    codice: data.codice,
  });
}

export function deleteNominativo(codice: string) {
  return db.deleteRows<Nominativo>("nominativi", { codice });
}

export function insertChiave(data: InsertChiaveData) {
  return db.insertRow<Chiave>("chiavi", data);
}

export function updateChiave(data: UpdateChiaveData) {
  return db.updateRows<Chiave>("chiavi", data.updateData, {
    codice: data.codice,
  });
}

export function deleteChiave(codice: string) {
  return db.deleteRows<Chiave>("chiavi", { codice });
}

export function insertVeicolo(data: InsertVeicoloData) {
  return db.insertRow<Veicolo>("veicoli", data);
}

export function updateVeicolo(data: UpdateVeicoloData) {
  return db.updateRows<Veicolo>("veicoli", data.updateData, {
    codice: data.codice,
  });
}

export function deleteVeicolo(codice: string) {
  return db.deleteRows<Veicolo>("veicoli", { codice });
}

export function getAssegnazioni() {
  return db.query<{ value: string }>("SELECT * FROM assegnazioni");
}

export function getEdifici() {
  return db.query<{ value: string }>("SELECT * FROM edifici");
}

export function getTVeicoli() {
  return db.query<{ value: string }>("SELECT * FROM tveicoli");
}

export function getNominativoByCodice(codice: string) {
  return db.query<Nominativo>("SELECT * FROM nominativi WHERE codice = $1", [
    codice,
  ]);
}

export function getProvvisorioByCodice(codice: string) {
  return db.query<Provvisorio>("SELECT * FROM provvisori WHERE codice = $1", [
    codice,
  ]);
}

export function getVeicoloByCodice(codice: string) {
  return db.query<Veicolo>("SELECT * FROM veicoli WHERE codice = $1", [codice]);
}

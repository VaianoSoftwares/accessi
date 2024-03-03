import * as db from "./index.js";
import {
  Chiave,
  DeletePersonaData,
  Nominativo,
  Persona,
  Provvisorio,
  Veicolo,
} from "../types/badges.js";
import {
  FindBadgesFilter,
  FindPersoneFilter,
  InsertChiaveData,
  InsertNominativoData,
  InsertPersonaData,
  InsertProvvisorioData,
  InsertVeicoloData,
  UpdateChiaveData,
  UpdateNominativoData,
  UpdatePersonaData,
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
    ? [prefixText, "WHERE", filterText, "ORDER BY tipo"].join(" ")
    : [prefixText, "ORDER BY tipo"].join(" ");
  const queryValues =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value]) =>
        key === "cliente" || typeof value !== "string"
          ? value
          : `%${value.toUpperCase()}%`
      )
      .flat();

  return await db.query(queryText, queryValues);
}

export function insertProvvisorio(data: InsertProvvisorioData) {
  return db.insertRow<Provvisorio>("provvisori", data);
}

export function updateProvvisorio(data: UpdateProvvisorioData) {
  return db.updateRows<Provvisorio>("provvisori", data, {
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
  return db.updateRows<Nominativo>("nominativi", data, { codice: data.codice });
}

export function deleteNominativo(codice: string) {
  return db.deleteRows<Nominativo>("nominativi", { codice });
}

export function insertChiave(data: InsertChiaveData) {
  return db.insertRow<Chiave>("chiavi", data);
}

export function updateChiave(data: UpdateChiaveData) {
  return db.updateRows<Chiave>("chiavi", data, { codice: data.codice });
}

export function deleteChiave(codice: string) {
  return db.deleteRows<Chiave>("chiavi", { codice });
}

export function insertVeicolo(data: InsertVeicoloData) {
  return db.insertRow<Veicolo>("veicoli", data);
}

export function updateVeicolo(data: UpdateVeicoloData) {
  return db.updateRows<Veicolo>("veicoli", data, { codice: data.codice });
}

export function deleteVeicolo(codice: string) {
  return db.deleteRows<Veicolo>("veicoli", { codice });
}

export async function getPersone(filter?: FindPersoneFilter) {
  const prefixText = "SELECT * FROM persone";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value], i) =>
        typeof value === "string" ? `${key} LIKE $${i + 1}` : `${key}=$${i + 1}`
      )
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, filterText].join(" WHERE ")
    : prefixText;
  const queryValues =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([, value]) => (typeof value === "string" ? `%${value}%` : value));

  return await db.query(queryText, queryValues);
}

export function insertPersona(data: InsertPersonaData) {
  return db.insertRow<Persona>("persone", data);
}

export function updatePersona(data: UpdatePersonaData) {
  return db.updateRows<Persona>("persone", data.updateData, data.docInfo);
}

export function deletePersona(data: DeletePersonaData) {
  return db.deleteRows<Persona>("persone", data);
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

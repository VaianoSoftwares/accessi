import * as db from "./index.js";
import {
  ChiaveInsertData,
  ChiaveUpdateData,
  DeletePersonaData,
  InsertPersonaData,
  Nominativo,
  NominativoInsertData,
  NominativoUpdateData,
  Provvisorio,
  ProvvisorioInsertData,
  ProvvisorioUpdateData,
  UpdatePersonaData,
  Veicolo,
  VeicoloInsertData,
  VeicoloUpdateData,
} from "../types/badges.js";
import { FindBadgesFilter, FindPersoneFilter } from "../utils/validation.js";

export async function getBadges(filter?: FindBadgesFilter) {
  const prefixText = "SELECT * FROM all_badges";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([key, value]) => value)
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
    Object.values(filter)
      .filter((value) => value)
      .map((value) => (typeof value === "string" ? `%${value}%` : value));

  return await db.query(queryText, queryValues);
}

export function insertProvvisorio(data: ProvvisorioInsertData) {
  return db.insertRow("provvisori", data);
}

export function updateProvvisorio(codice: string, data: ProvvisorioUpdateData) {
  return db.updateRows("provvisori", data, { codice });
}

export function deleteProvvisorio(codice: string) {
  return db.deleteRows("provvisori", { codice });
}

export function insertNominativo(data: NominativoInsertData) {
  return db.insertRow("nominativi", data);
}

export function updateNominativo(codice: string, data: NominativoUpdateData) {
  return db.updateRows("nominativi", data, { codice });
}

export function deleteNominativo(codice: string) {
  return db.deleteRows("nominativi", { codice });
}

export function insertChiave(data: ChiaveInsertData) {
  return db.insertRow("chiavi", data);
}

export function updateChiave(codice: string, data: ChiaveUpdateData) {
  return db.updateRows("chiavi", data, { codice });
}

export function deleteChiave(codice: string) {
  return db.deleteRows("chiavi", { codice });
}

export function insertVeicolo(data: VeicoloInsertData) {
  return db.insertRow("veicoli", data);
}

export function updateVeicolo(codice: string, data: VeicoloUpdateData) {
  return db.updateRows("veicoli", data, { codice });
}

export function deleteVeicolo(codice: string) {
  return db.deleteRows("veicoli", { codice });
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
    Object.values(filter)
      .filter((value) => value)
      .map((value) => (typeof value === "string" ? `%${value}%` : value));

  return await db.query(queryText, queryValues);
}

export function insertPersona(data: InsertPersonaData) {
  return db.insertRow("persone", data);
}

export function updatePersona(
  data: UpdatePersonaData,
  filter?: FindPersoneFilter
) {
  return db.updateRows("persone", data, filter);
}

export function deletePersona(data: DeletePersonaData) {
  return db.deleteRows("persone", data);
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

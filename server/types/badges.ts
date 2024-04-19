import { InsertBadgeData } from "../utils/validation.js";
import { Person } from "./people.js";

export type BadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TBadge = "NOMINATIVO" | "PROVVISORIO" | "CHIAVE" | "VEICOLO";

export enum BadgePrefix {
  NOMINATIVO = 1,
  PROVVISORIO,
  CHIAVE,
  VEICOLO,
}

export const TIPI_BADGE = [
  "NOMINATIVO",
  "PROVVISORIO",
  "CHIAVE",
  "VEICOLO",
] as const;
export const STATI_BADGE = [
  "VALIDO",
  "SCADUTO",
  "REVOCATO",
  "RICONSEGNATO",
] as const;

export interface Badge {
  codice: string;
  descrizione: string | null;
  stato: BadgeStato;
  cliente: string;
  ubicazione: string | null;
  proprietario: number | null;
}

export type BadgeNominativo = Badge & Person;

export type ParsedInsertBadgeData = Pick<Badge, "codice"> &
  Omit<InsertBadgeData, "provvisorio">;

export type BadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE";
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
export const TDOCS = ["CARTA IDENTITA", "PATENTE", "TESSERA STUDENTE"] as const;

interface BaseBadge {
  codice: string;
  descrizione: string | null;
  stato: BadgeStato;
  cliente: string;
}

export interface Provvisorio extends BaseBadge {
  ubicazione: string | null;
}

export interface BaseNominativo {
  nome: string;
  cognome: string;
  ditta: string | null;
  telefono: string | null;
  ndoc: string | null;
  tdoc: TDoc | null;
}
export interface Nominativo extends BaseBadge, BaseNominativo {
  assegnazione: string;
  scadenza: Date | string | null;
}

export interface BaseChiave {
  indirizzo: string | null;
  citta: string | null;
  edificio: string | null;
  piano: string | null;
}
export interface Chiave extends BaseBadge, BaseChiave {
  ubicazione: string | null;
}

export interface BaseVeicolo {
  tveicolo: string | null;
  targa1: string | null;
  targa2: string | null;
  targa3: string | null;
  targa4: string | null;
}
export interface Veicolo extends BaseBadge, BaseVeicolo, BaseNominativo {}

export type Badge = Provvisorio &
  Nominativo &
  Chiave &
  Veicolo & { tipo: TBadge };

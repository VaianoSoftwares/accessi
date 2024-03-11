export type BadgeTipo =
  | "PROVVISORIO"
  | "NOMINATIVO"
  | "CHIAVE"
  | "VEICOLO"
  | "PERSONA";
export type BadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE" | "";

export const TIPI_BADGE: ReadonlyArray<BadgeTipo> = [
  "NOMINATIVO",
  "PROVVISORIO",
  "CHIAVE",
  "VEICOLO",
  "PERSONA",
];
export const STATI_BADGE: ReadonlyArray<BadgeStato> = [
  "VALIDO",
  "SCADUTO",
  "REVOCATO",
  "RICONSEGNATO",
];
export const TDOCS: ReadonlyArray<TDoc> = [
  "CARTA IDENTITA",
  "PATENTE",
  "TESSERA STUDENTE",
];

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
  Veicolo & { tipo: BadgeTipo };

export type BadgeGenericReq<T> = { data: T; tipoBadge: string };
export type BadgeFormDataReq = BadgeGenericReq<FormData>;
export type BadgeDeleteReq = BadgeGenericReq<{ codice: string }>;

export type Postazione = {
  id: number;
  cliente: string;
  name: string;
};

export type GetPostazioniFilters = { ids?: number[] };
export type InsertPostazioneData = Omit<Postazione, "id">;

import { WithId } from ".";

export type BadgeTipo =
  | "PROVVISORIO"
  | "NOMINATIVO"
  | "CHIAVE"
  | "VEICOLO"
  | "PERSONA";
export type BadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE" | "";

export enum BadgePrefix {
  NOMINATIVO = 1,
  PROVVISORIO,
  CHIAVE,
  VEICOLO,
}

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

export interface BaseBadge {
  codice: string;
  descrizione: string | null;
  stato: BadgeStato;
  ubicazione: string | null;
}
export interface Badge extends BaseBadge {
  cliente: string;
  proprietario: number | null;
}

export interface BaseNominativo {
  nome: string;
  cognome: string;
  assegnazione: string;
  ditta: string | null;
  telefono: string | null;
  ndoc: string | null;
  tdoc: TDoc | null;
}
export interface BasePerson extends BaseNominativo {
  scadenza: Date | string | null;
  cliente: string;
}
export type Person = WithId<BasePerson>;

export interface BaseChiave {
  indirizzo: string | null;
  citta: string | null;
  edificio: string | null;
  piano: string | null;
}
export interface Chiave extends Badge, BaseChiave {}

export interface BaseVeicolo {
  targa: string;
  tipo: string;
}
export type Veicolo = WithId<
  BaseVeicolo & { cliente: string; proprietario: number | null }
>;

export type FullBadge = Badge & Person & Chiave & Veicolo & { tipo: BadgeTipo };

export type BadgeDeleteReq = Pick<Badge, "codice">;
export type PersonDeleteReq = Pick<Person, "id">;
export type ChiaveDeleteReq = Pick<Chiave, "codice">;
export type VeicoloDeleteReq = Pick<Veicolo, "id">;

export type InsertReqRetData<T> = { insertedRow: T };
export type UpdateReqRetData<T> = { updatedRow: T };
export type DeleteReqRetData<T> = { deletedRow: T };

export type Postazione = WithId<{
  cliente: string;
  name: string;
}>;

export type GetPostazioniFilters = { ids?: number[] };
export type InsertPostazioneData = Omit<Postazione, "id">;

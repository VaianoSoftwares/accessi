import { WithId } from ".";

export enum BadgeType {
  NOMINATIVO = "NOMINATIVO",
  PROVVISORIO = "PROVVISORIO",
  CHIAVE = "CHIAVE",
  VEICOLO = "VEICOLO",
  MAZZO = "MAZZO",
}

export enum BadgePrefix {
  NOMINATIVO = 1,
  PROVVISORIO,
  CHIAVE,
  VEICOLO,
  MAZZO,
}

export enum BadgeState {
  VALIDO = "VALIDO",
  SCADUTO = "SCADUTO",
  REVOCATO = "REVOCATO",
  RICONSEGNATO = "RICONSEGNATO",
}

export enum DocType {
  CARTA_IDENTITA = "CARTA IDENTITA",
  PATENTE = "PATENTE",
  TESSERA_STUDENTE = "TESSERA STUDENTE",
  PASSAPORTO = "PASSAPORTO",
  TESSERINO_PROFESSIONALE = "TESSERINO PROFESSIONALE",
}

export const TIPI_BADGE = [
  BadgeType.NOMINATIVO,
  BadgeType.PROVVISORIO,
  BadgeType.CHIAVE,
  BadgeType.VEICOLO,
  BadgeType.MAZZO,
] as const;
export const STATI_BADGE = [
  BadgeState.VALIDO,
  BadgeState.SCADUTO,
  BadgeState.REVOCATO,
  BadgeState.RICONSEGNATO,
] as const;
export const TDOCS = [
  DocType.CARTA_IDENTITA,
  DocType.PATENTE,
  DocType.TESSERA_STUDENTE,
  DocType.PASSAPORTO,
  DocType.TESSERINO_PROFESSIONALE,
] as const;

export interface BaseBadge {
  codice: string;
  descrizione: string | null;
  stato: BadgeState;
  cliente: string;
}

export interface Provvisorio extends BaseBadge {
  ubicazione: string | null;
}

export interface BaseNominativo {
  nome: string;
  cognome: string;
  assegnazione: string;
  ditta: string | null;
  cod_fisc: string | null;
  ndoc: string | null;
  tdoc: DocType | null;
  telefono: string | null;
  scadenza: Date | null;
}

export interface Nominativo extends BaseBadge, BaseNominativo {}

export interface BaseChiave {
  indirizzo: string | null;
  edificio: string;
  citta: string | null;
  piano: string | null;
}

export type Chiave = BaseChiave & Provvisorio;

export interface BaseVeicolo {
  targa: string;
  tipo: string;
}

export interface Veicolo extends BaseVeicolo, BaseBadge {}

export type MazzoChiavi = BaseBadge;

export type BadgeDeleteReq = Pick<BaseBadge, "codice">;

export type InsertReqRetData<T> = { insertedRow: T };
export type UpdateReqRetData<T> = { updatedRow: T };
export type DeleteReqRetData<T> = { deletedRow: T };

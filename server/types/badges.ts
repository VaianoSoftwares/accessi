import {
  InsertChiaveData,
  InsertNominativoData,
  InsertProvvisorioData,
  InsertVeicoloData,
} from "../utils/validation.js";

export enum BadgeType {
  NOMINATIVO = "NOMINATIVO",
  PROVVISORIO = "PROVVISORIO",
  CHIAVE = "CHIAVE",
  VEICOLO = "VEICOLO",
}

export enum BadgePrefix {
  NOMINATIVO = 1,
  PROVVISORIO,
  CHIAVE,
  VEICOLO,
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
}

export const TIPI_BADGE = [
  BadgeType.NOMINATIVO,
  BadgeType.PROVVISORIO,
  BadgeType.CHIAVE,
  BadgeType.VEICOLO,
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

export interface Nominativo extends BaseBadge, BaseNominativo {
  zuc_cod: string;
}

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

export type ChiaveNominativo = Chiave &
  BaseNominativo & { chiave_cod: string; badge_cod: string };
export type VeicoloNominativo = Veicolo &
  BaseNominativo & { veh_cod: string; badge_cod: string };

export type ParsedInsertNomData = Pick<BaseBadge, "codice"> &
  InsertNominativoData;
export type ParsedInsertProvData = Pick<BaseBadge, "codice"> &
  InsertProvvisorioData;
export type ParsedInsertChiaveData = Pick<BaseBadge, "codice"> &
  InsertChiaveData;
export type ParsedInsertVeicoloData = Pick<BaseBadge, "codice"> &
  InsertVeicoloData;

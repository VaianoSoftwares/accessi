import isObjKey from "../utils/isObjKey.js";
import { KeysOf } from "./keysOf.js";

export type TBadgeTipo = "BADGE" | "CHIAVE" | "VEICOLO" | "PROVVISORIO";
export type TBadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TTDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE" | "";

export const TIPI_BADGE = [
  "BADGE",
  "CHIAVE",
  "VEICOLO",
  "PROVVISORIO",
] as const;
export const STATI_BADGE = [
  "VALIDO",
  "SCADUTO",
  "REVOCATO",
  "RICONSEGNATO",
] as const;
export const TDOCS = [
  "CARTA IDENTITA",
  "PATENTE",
  "TESSERA STUDENTE",
  "",
] as const;

export type TTarghe = {
  1: string;
  2: string;
  3: string;
  4: string;
};

type TPartialNom = {
  nome: string;
  cognome: string;
  ditta: string;
  telefono: string;
  ndoc: string;
  tdoc: TTDoc;
  scadenza: string;
};

export type TGenericNom = TPartialNom & { targhe: TTarghe | null };
export type TBadgeNom = TPartialNom & { targhe: null };
export type TVeicoloNom = TPartialNom & { targhe: TTarghe; scadenza: "" };

type TPartialBadge = {
  barcode: string;
  descrizione: string;
  tipo: TBadgeTipo;
  assegnazione: string;
  ubicazione: string;
  stato: TBadgeStato;
  cliente: string;
};

export type TGenericBadge = TPartialBadge & {
  nominativo: TGenericNom | null;
};
export type TProvvisorio = TGenericBadge & {
  tipo: "PROVVISORIO";
  nominativo: TBadgeNom & { scadenza: "" };
};
export type TBadge = TGenericBadge & {
  tipo: "BADGE";
  nominativo: TBadgeNom;
};
export type TChiave = TGenericBadge & {
  tipo: "CHIAVE";
  nominativo: null;
};
export type TVeicolo = TGenericBadge & {
  tipo: "VEICOLO";
  nominativo: TVeicoloNom;
};

type TTargheReq = {
  targa1?: string;
  targa2?: string;
  targa3?: string;
  targa4?: string;
};

type TBadgeNomReq = Partial<TPartialNom> & TTargheReq;

type TPartialBadgeReq = Partial<TPartialBadge> & TBadgeNomReq;

export type TBadgeFindReq = {
  [key: string]: string | undefined;
} & TPartialBadgeReq;
export type TBadgeAddReq = TBadgeFindReq & Pick<TGenericBadge, "barcode">;
export type TBadgeUpdReq = TBadgeAddReq;

const _TIPI_BADGE: KeysOf<TBadgeTipo> = {
  BADGE: null,
  CHIAVE: null,
  VEICOLO: null,
  PROVVISORIO: null,
};
const _STATI_BADGE: KeysOf<TBadgeStato> = {
  VALIDO: null,
  SCADUTO: null,
  REVOCATO: null,
  RICONSEGNATO: null,
};
const _TDOCS: KeysOf<TTDoc> = {
  "": null,
  "CARTA IDENTITA": null,
  PATENTE: null,
  "TESSERA STUDENTE": null,
};

type TBadgeReqAllKeys = keyof TPartialBadgeReq;
const BADGE_ALL_KEYS: KeysOf<TBadgeReqAllKeys> = {
  barcode: null,
  descrizione: null,
  tipo: null,
  assegnazione: null,
  ubicazione: null,
  stato: null,
  nome: null,
  cognome: null,
  ditta: null,
  telefono: null,
  ndoc: null,
  tdoc: null,
  scadenza: null,
  targa1: null,
  targa2: null,
  targa3: null,
  targa4: null,
  cliente: null,
};

type TProvvReqKeys = keyof TPartialBadge;
const PROVV_KEYS: KeysOf<TProvvReqKeys> = {
  barcode: null,
  descrizione: null,
  tipo: null,
  assegnazione: null,
  ubicazione: null,
  stato: null,
  cliente: null,
};

type TNomReqKeys = keyof TBadgeNomReq;
const NOM_KEYS: KeysOf<TNomReqKeys> = {
  nome: null,
  cognome: null,
  ditta: null,
  telefono: null,
  ndoc: null,
  tdoc: null,
  scadenza: null,
  targa1: null,
  targa2: null,
  targa3: null,
  targa4: null,
};

type TNomNoTargheKeys = keyof TPartialNom;
const NOM_KEYS_NO_TARGHE: KeysOf<TNomNoTargheKeys> = {
  nome: null,
  cognome: null,
  ditta: null,
  telefono: null,
  ndoc: null,
  tdoc: null,
  scadenza: null,
};

type TTargheKeys = keyof TTargheReq;
const TARGHE_KEYS: KeysOf<TTargheKeys> = {
  targa1: null,
  targa2: null,
  targa3: null,
  targa4: null,
};

export default class Badge {
  static toBadgeTipo(value: unknown): TBadgeTipo {
    if (typeof value !== "string") return "BADGE";

    if (isObjKey(value.toUpperCase(), _TIPI_BADGE))
      return value.toUpperCase() as TBadgeTipo;

    return "BADGE";
  }

  static toBadgeStato(value: unknown): TBadgeStato {
    if (typeof value !== "string") return "VALIDO";

    if (isObjKey(value.toUpperCase(), _STATI_BADGE))
      return value.toUpperCase() as TBadgeStato;

    return "VALIDO";
  }

  static toTDoc(value: unknown): TTDoc {
    if (typeof value !== "string") return "";

    if (isObjKey(value.toUpperCase(), _TDOCS))
      return value.toUpperCase() as TTDoc;

    return "";
  }

  static isBadgeKey(key: PropertyKey) {
    return isObjKey(key, BADGE_ALL_KEYS);
  }

  static isProvvKey(key: PropertyKey) {
    return isObjKey(key, PROVV_KEYS);
  }

  static isNomKey(key: PropertyKey) {
    return isObjKey(key, NOM_KEYS);
  }

  static isNomNoTargheKey(key: PropertyKey) {
    return isObjKey(key, NOM_KEYS_NO_TARGHE);
  }

  static isTargheKey(key: PropertyKey) {
    return isObjKey(key, TARGHE_KEYS);
  }
}

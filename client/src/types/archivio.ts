import { BadgeTipo } from "./badges";

export type QueryInStrutt = {
  id: string;
  codice: string;
  tipo: string;
  assegnazione: string;
  cliente: string;
  postazione: string;
  nome: string;
  cognome: string;
  ditta: string;
  data_in: Date | string;
};

export type FindInStrutt = {
  codice: string;
  tipo: string;
  assegnazione: string;
  cliente: string;
  postazione: string;
  nome: string;
  cognome: string;
  ditta: string;
  ndoc: string;
  tdoc: string;
  telefono: string;
  data_in: Date | string;
};

export type QueryInPrestito = {
  badge: string;
  chiave: string;
  cliente: string;
  postazione: string;
  assegnazione: string;
  nome: string;
  cognome: string;
  ditta: string;
  indirizzo: string;
  citta: string;
  edificio: string;
  piano: string;
  data_in: Date | string;
};

export type FindInPrestito = {
  badge: string;
  chiave: string;
  cliente: string;
  postazione: string;
  assegnazione: string;
  nome: string;
  cognome: string;
  ditta: string;
  telefono: string;
  ndoc: string;
  tdoc: string;
  indirizzo: string;
  citta: string;
  edificio: string;
  piano: string;
  data_in: Date | string;
};

export type InsertArchProvData = {
  codice: string;
  nome?: string;
  cognome?: string;
  ditta?: string;
  telefono?: string;
  ndoc: string;
  tdoc: string;
  postazione: number;
};

export type FindInStruttData = {
  codice?: string | undefined;
  assegnazione?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  tipiBadge?: BadgeTipo[] | undefined;
  clienti?: string[] | undefined;
  postazioni?: number[] | undefined;
};

export type TimbraDoc = {
  badge: string;
  postazione: number;
};

export type PrestitoChiaviData = {
  barcodes: string[];
  postazione: number;
};

export type FindInPrestitoData = {
  postazioni: number[];
};

export type TimbraRes = {
  row: QueryInStrutt;
  isEntering: boolean;
};

export type PrestitoChiaviRes = {
  in: { rows: QueryInPrestito }[];
  out: { rows: QueryInPrestito }[];
};

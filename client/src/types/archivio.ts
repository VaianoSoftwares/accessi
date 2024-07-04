export type QueryBadgeInStrutt = {
  id: string;
  codice: string;
  descrizione: string;
  assegnazione: string;
  cliente: string;
  postazione: string;
  nome: string;
  cognome: string;
  ditta: string;
  data_in: Date | string;
  ora_in: Date | string;
};

export type FindBadgeInStrutt = {
  codice: string;
  descrizione: string;
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
  ora_in: Date | string;
};

export type QueryVeicoloInStrutt = {
  id: string;
  targa: string;
  descrizione: string;
  assegnazione: string;
  tveicolo: string;
  cliente: string;
  postazione: string;
  nome: string;
  cognome: string;
  ditta: string;
  data_in: Date | string;
  ora_in: Date | string;
};

export type FindVeicoloInStrutt = {
  targa: string;
  descrizione: string;
  assegnazione: string;
  tveicolo: string;
  cliente: string;
  postazione: string;
  nome: string;
  cognome: string;
  ditta: string;
  ndoc: string;
  tdoc: string;
  telefono: string;
  data_in: Date | string;
  ora_in: Date | string;
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
  ora_in: Date | string;
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
  ora_in: Date | string;
};

export type InsertArchBadgeData = {
  codice: string;
  nome?: string;
  cognome?: string;
  ditta?: string;
  telefono?: string;
  ndoc?: string;
  tdoc?: string;
  post_id: number;
};

export type InsertArchVeicoloData = {
  targa: string;
  nome?: string;
  cognome?: string;
  ditta?: string;
  telefono?: string;
  ndoc?: string;
  tdoc?: string;
  post_id: number;
  tveicolo: string;
};

export type FindBadgeInStruttData = {
  codice?: string | undefined;
  assegnazione?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  clienti?: string[] | undefined;
  postazioniIds?: number[] | undefined;
};

export type FindVeicoloInStruttData = {
  targa?: string | undefined;
  assegnazione?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  clienti?: string[] | undefined;
  postazioniIds?: number[] | undefined;
};

export type TimbraBadgeDoc = {
  badge_cod: string;
  post_id: number;
};

export type TimbraVeicoloDoc = {
  targa: string;
  post_id: number;
};

export type PrestitoChiaviData = {
  barcodes: string[];
  post_id: number;
};

export type FindInPrestitoData = {
  postazioniIds: number[];
};

export type TimbraBadgeRes = {
  row: QueryBadgeInStrutt;
  isEntering: boolean;
};

export type TimbraVeicoloRes = {
  row: QueryVeicoloInStrutt;
  isEntering: boolean;
};

export type PrestitoChiaviRes = {
  in: { rows: QueryInPrestito }[];
  out: { rows: QueryInPrestito }[];
};

export type UpdateArchivioData = {
  data_in?: Date | string | undefined;
  ora_in?: Date | string | undefined;
  data_out?: Date | string | undefined;
  ora_out?: Date | string | undefined;
  id: number | string;
};

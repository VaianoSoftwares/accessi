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
  created_at: Date | string;
  mark_type: number;
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
  created_at: Date | string;
  mark_type: number;
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
  created_at: Date | string;
  mark_type: number;
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
  created_at: Date | string;
  mark_type: number;
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
  created_at: Date | string;
  mark_type: number;
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
  created_at: Date | string;
  mark_type: number;
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
  markType: number;
  newRows?: QueryBadgeInStrutt[];
};

export type TimbraVeicoloRes = {
  row: QueryVeicoloInStrutt;
  markType: number;
  newRows?: QueryVeicoloInStrutt[];
};

export type PrestitoChiaviRes = {
  in: { rows: QueryInPrestito[]; rowCount: number | null };
  out: { rows: QueryInPrestito[]; rowCount: number | null };
};

export type UpdateArchivioData = {
  created_at?: Date | string | undefined;
  id: number | string;
};

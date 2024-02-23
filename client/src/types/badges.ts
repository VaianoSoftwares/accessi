export type BadgeTipo = "PROVVISORIO" | "NOMINATIVO" | "CHIAVE" | "VEICOLO";
export type BadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE" | "";

export const TIPI_BADGE: ReadonlyArray<BadgeTipo> = [
  "NOMINATIVO",
  "PROVVISORIO",
  "CHIAVE",
  "VEICOLO",
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

export interface Provvisorio {
  codice: string;
  descrizione: string | null;
  stato: BadgeStato | null;
  ubicazione: string | null;
  cliente: string;
}

export interface BaseNominativo {
  nome: string | null;
  cognome: string | null;
  ditta: string | null;
  telefono: string | null;
  ndoc: string;
  tdoc: TDoc;
}
export interface Nominativo extends BaseNominativo {
  codice: string;
  descrizione: string | null;
  stato: BadgeStato | null;
  assegnazione: string | null;
  cliente: string;
  scadenza: Date | string | null;
}

export interface BaseChiave {
  indirizzo: string | null;
  citta: string | null;
  edificio: string | null;
  piano: string | null;
}
export interface Chiave extends BaseChiave {
  codice: string;
  descrizione: string | null;
  ubicazione: string | null;
  cliente: string;
}

export interface BaseVeicolo {
  tveicolo: string | null;
  targa1: string | null;
  targa2: string | null;
  targa3: string | null;
  targa4: string | null;
}
export interface Veicolo extends BaseVeicolo, BaseNominativo {
  codice: string;
  descrizione: string | null;
  stato: BadgeStato | null;
  cliente: string;
}

export type Persona = BaseNominativo;

export type Badge = Provvisorio &
  Nominativo &
  Chiave &
  Veicolo & { tipo: BadgeTipo };

export type BadgeGenericReq<T> = { data: T; tipoBadge: string };
export type BadgeFormDataReq = BadgeGenericReq<FormData>;
export type BadgeDeleteReq = BadgeGenericReq<{ barcode: string }>;

export type Postazione = {
  id: number;
  cliente: string;
  name: string;
};

export type GetPostazioniFilters = { ids?: number[] };
export type InsertPostazioneData = Omit<Postazione, "id">;

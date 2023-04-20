export type WithId<T> = T & { _id: string };

export type TPartialUser = {
  _id: string;
  username: string;
  admin: boolean;
  clienti: string[] | null;
  postazioni: string[] | null;
};

export type TUser = TPartialUser & {
  token: string;
};

export type TPostazione = {
  _id: string;
  cliente: string;
  name: string;
};

export type TAssegnazione = {
  badge: TBadgeTipo;
  name: string;
};

export type TPermesso = {
  username: string;
  date: string;
};

export type TimbraDoc = {
  barcode: string;
  cliente: string;
  postazione: string;
};

export type TEventInput = React.ChangeEvent<HTMLInputElement>;
export type TEventSelect = React.ChangeEvent<HTMLSelectElement>;
export type TEvent = TEventInput | TEventSelect;

export type TEnums = {
  assegnazione: TAssegnazione[];
  cliente: string[];
  postazione: TPostazione[];
};

export type TAlert = {
  readonly success: boolean;
  readonly msg: string;
};

export type TBadgeTipo = "PROVVISORIO" | "BADGE" | "CHIAVE" | "VEICOLO";
export type TBadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TTDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE" | "";

export const TIPI_BADGE: ReadonlyArray<TBadgeTipo> = [
  "BADGE",
  "PROVVISORIO",
  "CHIAVE",
  "VEICOLO",
];
export const STATI_BADGE: ReadonlyArray<TBadgeStato> = [
  "VALIDO",
  "SCADUTO",
  "REVOCATO",
  "RICONSEGNATO",
];
export const TDOCS: ReadonlyArray<TTDoc> = [
  "CARTA IDENTITA",
  "PATENTE",
  "TESSERA STUDENTE",
  "",
];

export type TPartialBadge = {
  barcode: string;
  descrizione: string;
  tipo: TBadgeTipo;
  assegnazione: string;
  stato: TBadgeStato;
  ubicazione: string;
};

export type TPartialNom = {
  nome: string;
  cognome: string;
  telefono: string;
  ditta: string;
  tdoc: TTDoc;
  ndoc: string;
  scadenza: string;
};

export type TTarghe = {
  targa1: string;
  targa2: string;
  targa3: string;
  targa4: string;
};

export type TFullNom = TPartialNom & TTarghe;

export type TBadgeResp = TPartialBadge & TFullNom;

export type TTableContent = {
  codice: string;
  tipo: TBadgeTipo;
  assegnaz: string;
  nome: string;
  cognome: string;
  ditta: string;
};

type TInStruttPartialContent = {
  cliente: string;
  postazione: string;
  entrata: string;
};

type TArchPartialContent = {
  cliente: string;
  postazione: string;
  ip: string;
  uscita: string;
};

export type TInStruttTableContent = TTableContent & TInStruttPartialContent;
export type TArchTableContent = TInStruttTableContent & TArchPartialContent;

export type GenericResponse = {
  readonly success: boolean;
  readonly msg: string;
  readonly data: unknown;
  readonly filter?: unknown[];
};

export type OkResponse = GenericResponse & {
  readonly success: true;
};

export type ErrResponse = GenericResponse & {
  readonly success: false;
  readonly data?: null;
};

export type LoginFormState = {
  username: string;
  password: string;
};

export type RegisterFormState = {
  username: string;
  password: string;
  admin: boolean;
  device: boolean;
  clienti: string[];
  postazioni: string[];
};

export type AssegnazFormState = {
  tipoBadge: TBadgeTipo;
  assegnazione: string;
};

export type TInStruttResp = Pick<
  TBadgeResp,
  "tipo" | "nome" | "cognome" | "ditta"
> & {
  codice: string;
  cliente: string;
  postazione: string;
  assegnaz: string;
  entrata: string;
};

export type TArchivioResp = TInStruttResp & { ip: string; uscita: string };

export type TTimbraResp = {
  timbra: TInStruttResp;
  badge: TBadgeResp;
  msg: string;
};

type TPartialArchivioChiave = {
  nominativo: string;
  nome: string;
  cognome: string;
  chiave: string;
  descrizione: string;
};

export type TInPrestito = { id: string } & TPartialArchivioChiave & {
    prestito: string;
  };

export type TArchivioChiave = TPartialArchivioChiave & {
  cliente: string;
  postazione: string;
  ip: string;
  prestito: string;
  reso: string;
};

export type TFindArchChiaviDoc = TPartialArchivioChiave & {
  dataInizio: string;
  dataFine: string;
};

export type TPrestitoDataReq = {
  barcodes: string[];
} & Pick<TArchivioChiave, "cliente" | "postazione">;

export type TPrestitoDataRes = {
  rese: string[];
  prestate: TInPrestito[];
};

export type TBadgeFormState = Partial<
  TBadgeResp & {
    pfp: string;
    postazione: string;
  }
>;

export type OspFormState = TBadgeFormState & {
  descrizione: "PROVVISORIO";
  tipo: "PROVVISORIO";
  stato: "VALIDO";
  assegnazione: "OSPITE";
  ubicazione: "";
};

export type GenericForm = Record<PropertyKey, unknown>;

export type FindBadgeDoc = Omit<TBadgeFormState, "pfp" | "scadenza">;

export type ArchivioFormState = {
  dataInizio: string;
  dataFine: string;
};

export type FindArchivioDoc = FindBadgeDoc & ArchivioFormState;

type TPartialDoc = {
  codice: string;
  azienda: string;
  nome: string;
  cognome: string;
};

export type TDocumento = TPartialDoc & {
  filename: string;
};

export type TDocFormState = Partial<TPartialDoc>;

export type TInStruttDataReq = {
  cliente?: string;
  postazione?: string;
  tipi?: TBadgeTipo[];
};

type TMonths =
  | "Gennaio"
  | "Febbraio"
  | "Marzo"
  | "Aprile"
  | "Maggio"
  | "Giugno"
  | "Luglio"
  | "Agosto"
  | "Settembre"
  | "Ottobre"
  | "Novembre"
  | "Dicembre";

export const MONTHS: ReadonlyArray<TMonths> = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

export const N_CALENDAR_ROWS = 6;
export const N_CALENDAR_COLS = 8;
export const W100_POS = N_CALENDAR_COLS - 1;
export const N_DATE_DIVS = N_CALENDAR_ROWS * N_CALENDAR_COLS - 1;

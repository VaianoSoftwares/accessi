export type WithId<T> = T & { _id: string };

export type TPartialUser = {
  _id: string;
  username: string;
  admin: boolean;
  postazioni: string[] | null;
  pages: string[] | null;
  canLogout: boolean;
  excel: boolean;
  provvisori: boolean;
};

export type TUser = TPartialUser & {
  token: string;
};

export type TFullUser = TPartialUser & { password: string; device: string };

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
  postazioneId: string;
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
  cliente: string;
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
  postazioni: string[];
  pages: string[];
  device: string;
  canLogout: boolean;
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
  postazioneId: string;
};

export type TPrestitoDataRes = {
  rese: string[];
  prestate: TInPrestito[];
};

export type TBadgeFormState = Partial<
  TBadgeResp & {
    pfp: string;
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

export type TInPrestitoDataReq = {
  postazioniIds?: string[];
};

export type TInStruttDataReq = TInPrestitoDataReq & {
  tipi?: TBadgeTipo[];
};

export type ProtocolloFile = {
  _id: string;
  filename: string;
  descrizione: string;
  data: Date | string;
  visibileDa: string[];
};
export type ProtocolloFindReq = Partial<
  Omit<ProtocolloFile, "data" | "_id">
> & {
  dataInzio?: Date | string;
  dataFine?: Date | string;
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

export type TAddPostazioneData = Omit<TPostazione, "_id">;
export type TDeletePostazioneData = Pick<TPostazione, "_id">;
export type TGetPostazioniFilters = { _id?: string[]; names?: string[] };

export type TPage =
  | "badge"
  | "chiavi"
  | "veicoli"
  | "archivio"
  | "protocollo"
  | "documenti";

export const PAGES: ReadonlyArray<TPage> = [
  "badge",
  "chiavi",
  "veicoli",
  "archivio",
  "protocollo",
  "documenti",
];

export type TAdminPage =
  | "register"
  | "users"
  | "assegnazioni"
  | "postazioni"
  | "clienti";

export const ADMIN_PAGES: ReadonlyArray<TAdminPage> = [
  "register",
  "users",
  "assegnazioni",
  "postazioni",
  "clienti",
];

export interface IPageInfo {
  readonly pathname: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly imagePath?: string;
}

export const PAGES_INFO: ReadonlyMap<TPage, IPageInfo> = new Map([
  [
    "badge",
    {
      pathname: "/badge",
      name: "Badge",
      title: "Gestione Badge",
      description: "Pagina di gestione badge",
      imagePath: "/badge_icon_128.png",
    },
  ],
  [
    "chiavi",
    {
      pathname: "/chiavi",
      name: "Chiavi",
      title: "Gestione Chiavi",
      description: "Pagina di gestione chiavi",
      imagePath: "/key_icon_128.png",
    },
  ],
  [
    "veicoli",
    {
      pathname: "/veicoli",
      name: "Veicoli",
      title: "Gestione Veicoli",
      description: "Pagina di gestione veicoli",
      imagePath: "/car_icon_128.png",
    },
  ],
  [
    "archivio",
    {
      pathname: "/archivio",
      name: "Archivio",
      title: "Archivio",
      description: "Monitoraggio archivio resoconti",
      imagePath: "/archive_icon_128.png",
    },
  ],
  [
    "protocollo",
    {
      pathname: "/protocollo",
      name: "Protocollo",
      title: "Protocollo Elettronico",
      description: "Pagina per condivisione documenti",
      imagePath: "/document_icon_128.png",
    },
  ],
  [
    "documenti",
    {
      pathname: "/documenti",
      name: "Documenti",
      title: "Documenti",
      description: "Gestione documenti di identità",
      imagePath: "/id_icon_128.png",
    },
  ],
]);

export const ADMIN_PAGES_INFO: ReadonlyMap<TAdminPage, IPageInfo> = new Map([
  [
    "register",
    {
      pathname: "/admin/register",
      name: "Registra",
      title: "Registra Account",
      description: "Registrazione nuovo account",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    "users",
    {
      pathname: "/admin/users",
      name: "Modifica Utenti",
      title: "Modifica Utenti",
      description: "Modifica account utenti",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    "assegnazioni",
    {
      pathname: "/admin/assegnazioni",
      name: "Assegnazioni",
      title: "Modifica Assegnazioni",
      description: "Gestione delle assegnazioni",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    "postazioni",
    {
      pathname: "/admin/postazioni",
      name: "Postazioni",
      title: "Modifica Postazioni",
      description: "Gestione delle postazioni",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    "clienti",
    {
      pathname: "/admin/clienti",
      name: "Clienti",
      title: "Modifica Clienti",
      description: "Gestione dei clienti",
      imagePath: "/user_icon_128.png",
    },
  ],
]);

export type TGenericPage = TPage | TAdminPage;

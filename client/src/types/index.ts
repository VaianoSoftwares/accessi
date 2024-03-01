import { BadgeTipo, BadgeStato, TDoc } from "./badges";
import { BaseError } from "./errors";

export type Ok<T> = { success: true; result: T };
export type Err<T> = { success: false; error: T };
export type Result<T, E extends BaseError = BaseError> = Ok<T> | Err<E>;

export const Ok = <T>(result: T): Ok<T> => ({ success: true, result });
export const Err = <T>(error: T): Err<T> => ({ success: false, error });

export type GenericForm = Record<PropertyKey, any>;
export type FormRef<
  K,
  E extends HTMLElement = HTMLInputElement | HTMLSelectElement
> = Record<keyof K, E | null>;

export type WithId<T> = T & { id: string };

export const MAX_UINT32 = 4294967295;

export type TEventInput = React.ChangeEvent<HTMLInputElement>;
export type TEventSelect = React.ChangeEvent<HTMLSelectElement>;
export type TEvent = TEventInput | TEventSelect;

export type HTMLElementEvent<T extends HTMLElement = HTMLElement> = Event & {
  target: T;
};

export type TAssegnazione = {
  badge: BadgeTipo;
  name: string;
};

export type TPermesso = {
  username: string;
  date: string;
};

export type TAlert = {
  readonly success: boolean;
  readonly msg: string;
};

export type TPartialBadge = {
  barcode: string;
  descrizione: string;
  tipo: BadgeTipo;
  assegnazione: string;
  stato: BadgeStato;
  ubicazione: string;
  cliente: string;
};

export type TPartialNom = {
  nome: string;
  cognome: string;
  telefono: string;
  ditta: string;
  tdoc: TDoc;
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
  tipo: BadgeTipo;
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

export type AssegnazFormState = {
  tipoBadge: BadgeTipo;
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

export type TGetPostazioniFilters = { _id?: string[]; names?: string[] };

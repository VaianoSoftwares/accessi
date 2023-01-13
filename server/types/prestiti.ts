import { TBadge, TChiave } from "./badges";
import { Nullable, Undefineable } from "./nullable"

type TPartialArchivioChiave = {
    nominativo: TBadge,
    chiave: TChiave,
    cliente: string,
    postazione: string,
};

export type TPrestitoDataReq = {
    [key: string]: Undefineable<string>,
} & Partial<TPartialArchivioChiave>;

type TDatePrestito = { prestito: Date };
export type TInPrestito = TPartialArchivioChiave & { id: string, data: TDatePrestito };

type TDatePrestNReso = TDatePrestito & { reso: Nullable<Date> };
export type TArchivioChiave = TPartialArchivioChiave & {
  ip: string;
  data: TDatePrestNReso;
};
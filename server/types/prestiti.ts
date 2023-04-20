import { TBadge, TChiave } from "./badges.js";

type TPartialArchivioChiave = {
    nominativo: TBadge,
    chiave: TChiave,
    cliente: string,
    postazione: string,
};

export type TPrestitoDataReq = {
    [key: string]: string | undefined,
} & Partial<TPartialArchivioChiave>;

type TDatePrestito = { prestito: Date };
export type TInPrestito = TPartialArchivioChiave & { id: string, data: TDatePrestito };

type TDatePrestNReso = TDatePrestito & { reso: Date | null };
export type TArchivioChiave = TPartialArchivioChiave & {
  ip: string;
  data: TDatePrestNReso;
};
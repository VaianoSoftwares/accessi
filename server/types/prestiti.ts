import { WithId } from "mongodb";
import { TBadge, TChiave } from "./badges.js";
import { TPostazione } from "./enums.js";

type TPartialArchivioChiave = {
  nominativo: TBadge;
  chiave: TChiave;
  postazione: WithId<TPostazione>;
  ip: string;
};

export type TPrestitoDataReq = {
  postazioniIds?: string | undefined;
} & Partial<TPartialArchivioChiave>;

type TDatePrestito = { prestito: Date };
export type TInPrestito = TPartialArchivioChiave & {
  data: TDatePrestito;
};

type TDatePrestNReso = TDatePrestito & { reso: Date | null };
export type TArchivioChiave = TPartialArchivioChiave & {
  data: TDatePrestNReso;
};

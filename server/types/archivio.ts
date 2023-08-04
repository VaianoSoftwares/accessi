import { WithId } from "mongodb";
import { TGenericBadge } from "./badges.js";
import { TPostazione } from "./enums.js";

export type TArchivioDataReq = {
  barcode: string;
  postazione: WithId<TPostazione>;
};

type TPartialArchivio = {
  badge: TGenericBadge;
  postazione: WithId<TPostazione>;
  ip: string;
};

type TDateEntra = { entrata: Date };

export type TInStrutt = TPartialArchivio & {
  data: TDateEntra;
};

type TArchivioDate = TDateEntra & { uscita: Date | null };

export type TArchivio = TPartialArchivio & {
  data: TArchivioDate;
};

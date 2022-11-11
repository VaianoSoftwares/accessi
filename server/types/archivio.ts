import { TGenericBadge } from "./badges.js";
import { Nullable, Undefineable } from "./nullable.js";

export type TArchivioDataReq = {
    [key: string]: Undefineable<string>,
    barcode: string,
    cliente: string,
    postazione: string,
};

type TPartialArchivio = {
    badge: TGenericBadge,
    cliente: string,
    postazione: string,
    ip: string,
};

type TDateEntra = { entrata: Date };

export type TInStrutt = TPartialArchivio & {
    data: TDateEntra,
};

type TArchivioDate = TDateEntra & { uscita: Nullable<Date> };

export type TArchivio = TPartialArchivio & {
    data: TArchivioDate,
};
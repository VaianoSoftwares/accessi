import { TBadge } from "./Badge";

export type ArchivioElem = {
    badge: TBadge;
    cliente: string;
    postazione: string;
    ip: string;
    data: {
        entrata: string;
        uscita?: string;
    };
};
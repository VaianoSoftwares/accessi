import { Badge } from "./Badge";

export type ArchivioElem = {
    badge: Badge;
    cliente: string;
    postazione: string;
    ip: string;
    data: {
        entrata: string;
        uscita?: string;
    };
};
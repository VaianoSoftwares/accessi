import { TBadgeTipo } from "../types/Badge";

export type TableContentElem = {
    codice: string;
    tipo: TBadgeTipo;
    assegnaz: string;
    nome: string;
    cognome: string;
    ditta: string;
};

type InStruttPartialContent = {
    entrata: string;
};

type ArchivioPartialContent = {
    cliente: string;
    postazione: string;
    uscita: string;
};

export type InStruttTableContent = TableContentElem & InStruttPartialContent;
export type ArchivioTableContent = InStruttTableContent & ArchivioPartialContent;
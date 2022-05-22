import { TipoBadge } from "../enums/TipoBadge";

export type TableContentElem = {
    codice: string;
    tipo: TipoBadge;
    assegnaz: string;
    nome: string;
    cognome: string;
    ditta: string;
};

type InStruttPartialContent = {
    entrata: string;
};

type ArchivioPartialContent = {
    uscita: string;
};

export type InStruttTableContent = TableContentElem & InStruttPartialContent;
export type ArchivioTableContent = InStruttTableContent & ArchivioPartialContent;
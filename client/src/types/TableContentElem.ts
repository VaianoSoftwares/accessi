import { TBadgeTipo } from "../types/Badge";

export type TTableContent = {
    codice: string;
    tipo: TBadgeTipo;
    assegnaz: string;
    nome: string;
    cognome: string;
    ditta: string;
};

type TInStruttPartialContent = {
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
import { StatoBadge } from "../enums/StatoBadge";
import { TipoBadge } from "../enums/TipoBadge";
import { Nominativo } from "./Nominativo";

export type ArchivioElem = {
    postazione: string;
    barcode: string;
    descrizione: string;
    tipo: TipoBadge;
    assegnazione: string;
    stato: StatoBadge;
    ubicazione: string;
    data: {
        entrata: string;
        uscita?: string;
    };
    nominativo: Nominativo;
};
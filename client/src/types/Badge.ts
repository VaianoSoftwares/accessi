import { StatoBadge } from "../enums/StatoBadge";
import { TipoBadge } from "../enums/TipoBadge";
import { Nominativo } from "./Nominativo";

export type Badge = {
    barcode: string;
    descrizione: string;
    tipo: TipoBadge;
    assegnazione: string;
    stato: StatoBadge;
    ubicazione: string;
    nominativo?: Nominativo;
};
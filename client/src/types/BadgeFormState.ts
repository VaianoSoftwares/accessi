import { StatoBadge } from "../enums/StatoBadge";
import { TipoBadge } from "../enums/TipoBadge";
import { Nullable } from "./Nullable";

export type BadgeFormState = {
    barcode: string;
    descrizione: string;
    tipo: TipoBadge;
    assegnazione: string;
    stato: StatoBadge;
    ubicazione: string;
    nome: string;
    cognome: string;
    telefono: string;
    ditta: string;
    tdoc: string;
    ndoc: string;
    pfp: Nullable<File>;
    scadenza: number;
    targa1: string;
    targa2: string;
    targa3: string;
    targa4: string;
};
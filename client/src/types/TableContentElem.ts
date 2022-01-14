import { TipoBadge } from "../enums/TipoBadge";

export type TableContentElem = {
    codice: string;
    tipo: TipoBadge;
    assegnaz: string;
    nome: string;
    cognome: string;
    ditta: string;
    "data ora consegna": string | undefined;
    "data ora in": string | undefined;
};
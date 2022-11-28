export type TBadgeTipo = "BADGE" | "CHIAVE" | "VEICOLO";
export type TBadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TTDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE" | "";

export type TTarghe = {
    1: string,
    2: string,
    3: string,
    4: string,
};

export type TNominativo = {
    nome: string;
    cognome: string;
    telefono: string;
    ditta: string;
    tdoc: TTDoc;
    ndoc: string;
    scadenza?: string;
    targhe?: TTarghe;
};

export type TBadge = {
    barcode: string;
    descrizione: string;
    tipo: TBadgeTipo;
    assegnazione: string;
    stato: TBadgeStato;
    ubicazione: string;
    nominativo?: TNominativo;
};
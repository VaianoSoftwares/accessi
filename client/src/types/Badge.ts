export type TBadgeTipo = "PROVVISORIO" | "BADGE" | "CHIAVE" | "VEICOLO";
export type TBadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TTDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE" | "";

export type TPartialBadge = {
    barcode: string;
    descrizione: string;
    tipo: TBadgeTipo;
    assegnazione: string;
    stato: TBadgeStato;
    ubicazione: string;
};

export type TPartialNom = {
    nome: string;
    cognome: string;
    telefono: string;
    ditta: string;
    tdoc: TTDoc;
    ndoc: string;
    scadenza: string;
};

export type TTarghe = {
    targa1: string;
    targa2: string;
    targa3: string;
    targa4: string;
};

export type TFullNom = TPartialNom & TTarghe;

export type TBadgeResp = TPartialBadge & TFullNom;
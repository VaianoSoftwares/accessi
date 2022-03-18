export type Nominativo = {
    nome: string;
    cognome: string;
    telefono: string;
    ditta: string;
    tdoc: string;
    ndoc: string;
    scadenza?: string;
    targhe?: {
        1: string;
        2: string;
        3: string;
        4: string;
    };
};
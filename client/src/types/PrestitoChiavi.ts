type TPartialArchivioChiave = {
    nominativo: string;
    nome: string;
    cognome: string;
    chiave: string;
    descrizione: string;
};

export type TInPrestito = { id: string } & TPartialArchivioChiave & {
    prestito: string;
  };

export type TArchivioChiave = TPartialArchivioChiave & {
  cliente: string;
  postazione: string;
  ip: string;
  prestito: string;
  reso: string;
};

export type TFindArchChiaviDoc = TPartialArchivioChiave & {
  dataInizio: string;
  dataFine: string;
};

export type TPrestitoDataReq = {
  barcodes: string[];
} & Pick<TArchivioChiave, "cliente" | "postazione">;

export type TPrestitoDataRes = {
  rese: string[];
  prestate: TInPrestito[];
};
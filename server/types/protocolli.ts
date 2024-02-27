export interface Protocollo {
  id: number;
  descrizione: string | null;
  date: Date;
}

export interface DocProtocollo {
  filename: string;
  descrizione: string | null;
  prot_id: number;
}

export interface ProtVisibileDa {
  prot_id: number;
  prot_user: number;
}

export type FullProtocollo = Pick<Protocollo, "id" | "date"> &
  Pick<DocProtocollo, "filename"> & {
    prot_descrizione: string | null;
    doc_descrizione: string | null;
    visibile_da_id: number[];
    visibile_da_name: string[];
  };

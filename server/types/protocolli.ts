import { WithId } from "./index.js";

export interface BaseProtocollo {
  descrizione: string | null;
  date: Date;
}

export type Protocollo = WithId<BaseProtocollo>;

export interface BaseDocProtocollo {
  filename: string;
  descrizione: string | null;
}

export type DocProtocollo = BaseDocProtocollo & { prot_id: number };

export type ProtVisibileDa = { prot_id: number; usr_id: number };

export type FullProtocollo = Pick<BaseProtocollo, "date"> &
  Pick<BaseDocProtocollo, "filename"> & {
    prot_descrizione: string | null;
    doc_descrizione: string | null;
    visibile_da_id: number[];
    visibile_da_name: string[];
  };

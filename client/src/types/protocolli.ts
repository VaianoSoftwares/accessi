export type FullProtocollo = {
  id: number;
  date: Date | string;
  filename: string;
  prot_descrizione: string | null;
  doc_descrizione: string | null;
  visibile_da_id: number[];
  visibile_da_name: string[];
};

import { WithId } from "./index.js";

export type TDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE";
export const TDOCS = ["CARTA IDENTITA", "PATENTE", "TESSERA STUDENTE"] as const;

export interface BasePerson {
  nome: string;
  cognome: string;
  assegnazione: string;
  ditta: string | null;
  ndoc: string | null;
  tdoc: TDoc | null;
  telefono: string | null;
  scadenza: Date | null;
}

export type Person = WithId<BasePerson & { cliente: string }>;

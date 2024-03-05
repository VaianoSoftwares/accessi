export type BadgeStato = "VALIDO" | "SCADUTO" | "REVOCATO" | "RICONSEGNATO";
export type TDoc = "CARTA IDENTITA" | "PATENTE" | "TESSERA STUDENTE";
export type TBadge = "NOMINATIVO" | "PROVVISORIO" | "CHIAVE" | "VEICOLO";

export enum BadgePrefix {
  NOMINATIVO,
  PROVVISORIO,
  CHIAVE,
  VEICOLO,
}

export const TIPI_BADGE = [
  "NOMINATIVO",
  "PROVVISORIO",
  "CHIAVE",
  "VEICOLO",
] as const;
export const STATI_BADGE = [
  "VALIDO",
  "SCADUTO",
  "REVOCATO",
  "RICONSEGNATO",
] as const;
export const TDOCS = ["CARTA IDENTITA", "PATENTE", "TESSERA STUDENTE"] as const;

interface BaseBadge {
  codice: string;
  descrizione: string | null;
  cliente: string;
}

export interface Provvisorio extends BaseBadge {
  stato: BadgeStato | null;
  ubicazione: string | null;
}

export interface BaseNominativo {
  nome: string | null;
  cognome: string | null;
  ditta: string | null;
  telefono: string | null;
  ndoc: string;
  tdoc: TDoc;
}
export interface Nominativo extends BaseBadge, BaseNominativo {
  stato: BadgeStato | null;
  assegnazione: string | null;
  scadenza: Date | string | null;
}

export interface BaseChiave {
  indirizzo: string | null;
  citta: string | null;
  edificio: string | null;
  piano: string | null;
}
export interface Chiave extends BaseBadge, BaseChiave {
  ubicazione: string | null;
}

export interface BaseVeicolo {
  tveicolo: string | null;
  targa1: string | null;
  targa2: string | null;
  targa3: string | null;
  targa4: string | null;
}
export interface Veicolo extends BaseBadge, BaseVeicolo, BaseNominativo {
  stato: BadgeStato | null;
}

export type Persona = BaseNominativo & Pick<BaseBadge, "cliente">;

export type Badge = Provvisorio & Nominativo & Chiave & Veicolo & Persona;

// export type FindBadgesFilter = Partial<Badge>;
// export type ProvvisorioInsertData = Partial<Provvisorio> &
//   Pick<Provvisorio, "codice" | "cliente">;
// export type ProvvisorioUpdateData = Partial<Provvisorio>;
// export type NominativoInsertData = Partial<Nominativo> &
//   Pick<Nominativo, "codice" | "cliente" | "ndoc" | "tdoc">;
// export type NominativoUpdateData = Partial<Nominativo>;
// export type ChiaveInsertData = Partial<Chiave> &
//   Pick<Chiave, "codice" | "cliente">;
// export type ChiaveUpdateData = Partial<Chiave>;
// export type VeicoloInsertData = Partial<Veicolo> &
//   Pick<Veicolo, "codice" | "cliente" | "ndoc" | "tdoc">;
// export type VeicoloUpdateData = Partial<Veicolo>;

// export type FindPersoneFilter = Partial<Persona>;
// export type InsertPersonaData = Partial<Persona> &
//   Pick<Persona, "ndoc" | "tdoc">;
// export type UpdatePersonaData = Partial<Persona>;
export type DeletePersonaData = Pick<Persona, "ndoc" | "tdoc">;

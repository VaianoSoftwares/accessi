export type AnagraficoForm = {
  codice?: string | undefined;
  descrizione?: string | undefined;
  tipo?: string | undefined;
  assegnazione?: string | undefined;
  stato?: string | undefined;
  ubicazione?: string | undefined;
  cliente?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  telefono?: string | undefined;
  ditta?: string | undefined;
  tdoc?: string | undefined;
  ndoc?: string | undefined;
  scadenza?: string | undefined;
  pfp?: string | undefined;
  privacy?: string | undefined;
  documento?: string | undefined;
  indirizzo?: string | undefined;
  citta?: string | undefined;
  edificio?: string | undefined;
  piano?: string | undefined;
  tveicolo?: string | undefined;
  targa1?: string | undefined;
  targa2?: string | undefined;
  targa3?: string | undefined;
  targa4?: string | undefined;
};

export type FindInStruttForm = {
  badge?: string | undefined;
  assegnazione?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
};

export type InsertArchProvForm = {
  badge?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  telefono?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  documento?: string | undefined;
};

export type FindArchivioForm = {
  badge?: string | undefined;
  chiave?: string | undefined;
  tipo?: string | undefined;
  cliente?: string | undefined;
  postazione?: string | undefined;
  assegnazione?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  data_in_min?: string | undefined;
  data_in_max?: string | undefined;
};

export type ProtocolloForm = {
  filename?: string | undefined;
  prot_descrizione?: string | undefined;
  dataInizio?: string | undefined;
  dataFine?: string | undefined;
  fileData?: string | undefined;
  visibileDa?: string | undefined;
};

export type RegisterForm = {
  name?: string | undefined;
  password?: string | undefined;
  postazioni?: string[] | undefined;
  pages?: string[] | undefined;
  permessi?: string[] | undefined;
};

export type UpdateUserForm = RegisterForm;

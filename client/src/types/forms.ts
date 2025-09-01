export type BaseForm = Partial<{
  [key: string]: string | string[] | undefined;
}>;

export type AnagraficoForm = {
  codice?: string | undefined;
  descrizione?: string | undefined;
  stato?: string | undefined;
  cliente?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  assegnazione?: string | undefined;
  ditta?: string | undefined;
  cod_fisc?: string | undefined;
  tdoc?: string | undefined;
  ndoc?: string | undefined;
  telefono?: string | undefined;
  scadenza?: string | undefined;
  pfp?: string | undefined;
  privacy?: string | undefined;
  documento?: string | undefined;
  ubicazione?: string | undefined;
  indirizzo?: string | undefined;
  citta?: string | undefined;
  edificio?: string | undefined;
  piano?: string | undefined;
  proprietario?: string[] | undefined;
  targa?: string | undefined;
  tipo?: string | undefined;
  zuc_cod?: string | undefined;
  mazzo?: string | undefined;
};

export type NominativiForm = {
  codice?: string | undefined;
  descrizione?: string | undefined;
  stato?: string | undefined;
  cliente?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  assegnazione?: string | undefined;
  ditta?: string | undefined;
  cod_fisc?: string | undefined;
  tdoc?: string | undefined;
  ndoc?: string | undefined;
  telefono?: string | undefined;
  scadenza?: string | undefined;
  pfp?: string | undefined;
  privacy?: string | undefined;
  documento?: string | undefined;
};

export type ProvvisoriForm = {
  codice?: string | undefined;
  descrizione?: string | undefined;
  stato?: string | undefined;
  ubicazione?: string | undefined;
  cliente?: string | undefined;
};

export type ChiaviForm = {
  codice?: string | undefined;
  descrizione?: string | undefined;
  stato?: string | undefined;
  ubicazione?: string | undefined;
  cliente?: string | undefined;
  indirizzo?: string | undefined;
  citta?: string | undefined;
  edificio?: string | undefined;
  piano?: string | undefined;
  proprietario?: string[] | undefined;
};

export type VeicoliForm = {
  codice?: string | undefined;
  descrizione?: string | undefined;
  stato?: string | undefined;
  targa?: string | undefined;
  tipo?: string | undefined;
  proprietario?: string[] | undefined;
  cliente?: string[] | undefined;
};

export type FindBadgesInStruttForm = {
  badge_cod?: string | undefined;
  assegnazione?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
};

export type FindVeicoliInStruttForm = {
  targa?: string | undefined;
  assegnazione?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  tveicolo?: string | undefined;
};

export type InsertArchBadgeForm = {
  badge_cod?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  cod_fisc?: string | undefined;
  telefono?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  assegnazione?: string | undefined;
  targa?: string | undefined;
  docs?: string | undefined;
};

export type InsertArchChiaveForm = {
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  cod_fisc?: string | undefined;
  telefono?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  docs?: string | undefined;
};

export type InsertArchVeicoloForm = {
  targa?: string | undefined;
  nome?: string | undefined;
  cognome?: string | undefined;
  ditta?: string | undefined;
  cod_fisc?: string | undefined;
  telefono?: string | undefined;
  ndoc?: string | undefined;
  tdoc?: string | undefined;
  tveicolo?: string | undefined;
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
  date_min?: string | undefined;
  date_max?: string | undefined;
  date_new?: string | undefined;
  id?: string | undefined;
  zuc_cod?: string | undefined;
  mark_type?: string | undefined;
};

export type FindArchivioFullForm = FindArchivioForm & {
  post_ids?: number[] | undefined; 
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
  postazioni_ids?: string[] | undefined;
  pages?: string[] | undefined;
  permessi?: string[] | undefined;
};

export type UpdateUserForm = RegisterForm;

export type GetTracciatoForm = {
  minDate?: string | undefined;
  maxDate?: string | undefined;
  zuc_cod?: string | undefined;
};

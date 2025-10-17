import { MAX_UINT32, WithId } from "./index.js";

export interface BaseUser {
  name: string;
  password: string;
  permessi: number;
  pages: number;
}
export type User = WithId<BaseUser>;

export interface BasePostazione {
  name: string;
  cliente: string;
}
export type Postazione = WithId<BasePostazione>;

export interface PostazioneUser {
  usr_id: number;
  post_id: number;
}

export enum TPermessi {
  admin = MAX_UINT32,
  device = 1 << 0,
  canLogout = 1 << 1,
  canAccessInStruttReport = 1 << 2,
  canMarkProvvisori = 1 << 3,
  canEditArchivio = 1 << 4,
  canEditBadges = 1 << 5,
  canEditPostazioni = 1 << 6,
  canEditUsers = 1 << 7,
  canEditClienti = 1 << 8,
  canEditAssegnazioni = 1 << 9,
  showNominativiInAnagrafico = 1 << 10,
  showProvvisoriInAnagrafico = 1 << 11,
  showChiaviInAnagrafico = 1 << 12,
  showVeicoliInAnagrafico = 1 << 13,
  showMazziInAnagrafico = 1 << 14,
  showPause = 1 << 15,
  canPerformPause = 1 << 16,
}
export enum TPages {
  admin = MAX_UINT32,
  badge = 1 << 0,
  chiavi = 1 << 1,
  veicoli = 1 << 2,
  archivio = 1 << 3,
  protocollo = 1 << 4,
  anagrafico = 1 << 5,
  postazioni = 1 << 6,
  clienti = 1 << 7,
  register = 1 << 8,
  users = 1 << 9,
  assegnazioni = 1 << 10,
}

export type InsertUserData = BaseUser & { postazioni: Postazione[] };
export type UpdateUserData = Partial<BaseUser>;

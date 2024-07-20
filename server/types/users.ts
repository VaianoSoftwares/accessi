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
  device = 1,
  canLogout = 2,
  excel = 4,
  provvisori = 8,
  updateArchivio = 16,
  canEditBadges = 32,
}
export enum TPages {
  admin = MAX_UINT32,
  badge = 1,
  chiavi = 2,
  veicoli = 4,
  archivio = 8,
  protocollo = 16,
  anagrafico = 32,
}

export type InsertUserData = BaseUser & { postazioni: Postazione[] };
export type UpdateUserData = Partial<BaseUser>;

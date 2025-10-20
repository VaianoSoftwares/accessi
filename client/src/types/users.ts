import { MAX_UINT32 } from ".";
import { checkBits, bitCount, getFirst } from "../utils/bitwise";
import { TPages } from "./pages";

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

export const PERMESSI_INFO: ReadonlyMap<TPermessi, string> = new Map([
  [TPermessi.device, "device (unused)"],
  [TPermessi.canLogout, "logout"],
  [TPermessi.showPause, "mostra pause"],
  [TPermessi.canPerformPause, "può andare in pausa"],
  [TPermessi.canAccessInStruttReport, "in struttura excel report"],
  [TPermessi.canMarkProvvisori, "timbra provvisori"],
  [TPermessi.canEditArchivio, "modifica archivio"],
  [TPermessi.canEditBadges, "modifica badge"],
  [TPermessi.canEditPostazioni, "modifica postazioni"],
  [TPermessi.canEditUsers, "modifica utenti"],
  [TPermessi.canEditClienti, "modifica clienti"],
  [TPermessi.canEditAssegnazioni, "modifica assegnazioni"],
  [TPermessi.showNominativiInAnagrafico, "mostra nominativi in anagrafico"],
  [TPermessi.showProvvisoriInAnagrafico, "mostra provvisori in anagrafico"],
  [TPermessi.showChiaviInAnagrafico, "mostra chiavi in anagrafico"],
  [TPermessi.showVeicoliInAnagrafico, "mostra veicoli in anagrafico"],
  [TPermessi.showMazziInAnagrafico, "mostra mazzi in anagrafico"],
]);

export type TUser = {
  id: string;
  name: string;
  password: string;
  permessi: number;
  pages: number;
  clienti: string[];
  postazioni_ids: number[];
};

export type LoginUserData = Pick<TUser, "name" | "password">;
export type InsertUserData = Omit<TUser, "id" | "clienti">;
export type UpdateUserData = Partial<InsertUserData>;

type MaybeTUser = TUser | null | undefined;

function isUser(user: MaybeTUser): user is TUser {
  return (
    user !== null && user !== undefined && "permessi" in user && "pages" in user
  );
}

export function hasPerm(user: MaybeTUser, perm: TPermessi) {
  return isUser(user) && checkBits(user.permessi, perm);
}

export function isAdmin(user: MaybeTUser) {
  return isUser(user) && checkBits(user.permessi, TPermessi.admin);
}

export function canAccessPage(user: MaybeTUser, page: TPages) {
  return isUser(user) && checkBits(user.pages, page);
}

export function getPagesNum(user: MaybeTUser) {
  return isUser(user) ? bitCount(user.pages) : 0;
}

export function getFirstPage(user: MaybeTUser) {
  return isUser(user) ? getFirst(user.pages) : 0;
}

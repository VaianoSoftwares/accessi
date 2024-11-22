import { MAX_UINT32 } from ".";
import { checkBits, bitCount, getFirst } from "../utils/bitwise";
import { TPages } from "./pages";

export enum TPermessi {
  admin = MAX_UINT32,
  device = 1,
  canLogout = 2,
  canAccessInStruttReport = 4,
  canMarkProvvisori = 8,
  canEditArchivio = 16,
  canEditBadges = 32,
  canEditPostazioni = 64,
  canEditUsers = 128,
  canEditClienti = 256,
  canEditAssegnazioni = 512,
}

export const PERMESSI_INFO: ReadonlyMap<TPermessi, string> = new Map([
  [TPermessi.device, "device"],
  [TPermessi.canLogout, "canLogout"],
  [TPermessi.canAccessInStruttReport, "inStruttExcelReport"],
  [TPermessi.canMarkProvvisori, "timbraProvvisori"],
  [TPermessi.canEditArchivio, "canEditArchivio"],
  [TPermessi.canEditBadges, "canEditBadges"],
  [TPermessi.canEditPostazioni, "canEditPostazioni"],
  [TPermessi.canEditUsers, "canEditUsers"],
  [TPermessi.canEditClienti, "canEditClienti"],
  [TPermessi.canEditAssegnazioni, "canEditAssegnazioni"],
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

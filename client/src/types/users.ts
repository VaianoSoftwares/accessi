import { MAX_UINT32 } from ".";
import { checkBits, bitCount, getFirst } from "../utils/bitwise";
import { TPages } from "./pages";

export enum TPermessi {
  admin = MAX_UINT32,
  device = 1,
  canLogout = 2,
  excel = 4,
  provvisori = 8,
}

export const PERMESSI_INFO: ReadonlyMap<TPermessi, string> = new Map([
  [TPermessi.device, "device"],
  [TPermessi.canLogout, "canLogout"],
  [TPermessi.excel, "excel"],
  [TPermessi.provvisori, "provvisori"],
]);

export type TUser = {
  id: string;
  name: string;
  password: string;
  permessi: number;
  pages: number;
  clienti: string[];
  postazioni: number[];
};

export type TLoggedUser = TUser & {
  token: string;
};

export type LoginUserData = Pick<TUser, "name" | "password">;
export type InsertUserData = Omit<TUser, "id" | "clienti">;
export type UpdateUserData = Partial<InsertUserData>;

export function hasPerm(user: TUser, perm: TPermessi) {
  return checkBits(user.permessi, perm);
}

export function isAdmin(user: TUser) {
  return checkBits(user.permessi, TPermessi.admin);
}

export function canAccessPage(user: TUser, page: TPages) {
  return checkBits(user.permessi, page);
}

export function getPagesNum(user: TUser) {
  return bitCount(user.pages);
}

export function getFirstPage(user: TUser) {
  return getFirst(user.pages);
}

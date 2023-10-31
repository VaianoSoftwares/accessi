import { ObjectId } from "mongodb";

export type TUser = {
  username: string;
  password: string;
  admin: boolean;
  postazioni: ObjectId[] | null;
  clienti: string[] | null;
  pages: string[] | null;
  device: boolean;
  canLogout: boolean;
  excel: boolean;
  provvisori: boolean;
};

export type TUserReq = {
  [key: string]: string | string[] | boolean | undefined;
} & Pick<TUser, "username" | "password"> &
  Partial<Omit<TUser, "username" | "password">>;

export type TPermesso = {
  username: string;
  date: string;
};

export type TPermessoReq = {
  [key: string]: string | undefined;
} & Partial<TPermesso>;

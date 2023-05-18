import { ObjectId } from "mongodb";

export type TUser = {
  username: string;
  password: string;
  admin: boolean;
  postazioni: ObjectId[] | null;
  pages: string[] | null;
  device: string | null;
  canLogout: boolean;
};

export type TUserReq = {
  [key: string]: string | string[] | boolean | undefined;
} & Pick<TUser, "username" | "password"> &
  Partial<Omit<TUser, "username" | "password">>;

export type TUserResp = { id: string | ObjectId } & Omit<
  TUser,
  "password" | "device"
>;

export type TPermesso = {
  username: string;
  date: string;
};

export type TPermessoReq = {
  [key: string]: string | undefined;
} & Partial<TPermesso>;

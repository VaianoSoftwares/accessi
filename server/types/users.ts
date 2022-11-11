import { Undefineable } from "./nullable.js";

export type TUser = {
    username: string,
    password: string,
    admin: boolean
};

export type TUserReq = {
    [key: string]: Undefineable<string | boolean>,
    username: string,
    password: string,
    admin?: boolean
};

export type TPermesso = {
    username: string,
    date: string
};

export type TPermessoReq = {
  [key: string]: Undefineable<string>;
} & Partial<TPermesso>;
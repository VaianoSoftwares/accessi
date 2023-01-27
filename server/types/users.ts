export type TUser = {
    username: string,
    password: string,
    admin: boolean,
    clienti: string[] | null,
    postazioni: string[] | null,
    device: boolean,
};

export type TUserReq = {
    [key: string]: string | string[] | boolean | undefined,
    username: string,
    password: string,
    admin?: boolean,
    clienti?: string[],
    postazioni?: string[],
};

export type TPermesso = {
    username: string,
    date: string
};

export type TPermessoReq = {
  [key: string]: string | undefined;
} & Partial<TPermesso>;
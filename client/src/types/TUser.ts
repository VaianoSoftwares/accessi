export type TPartialUser = {
    _id: string;
    username: string;
    admin: boolean;
    clienti: string[] | null;
    postazioni: string[] | null;
};

export type TUser = TPartialUser & {
    token: string;
}
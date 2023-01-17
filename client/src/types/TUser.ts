export type TPartialUser = {
    name: string;
    admin: boolean;
};

export type TUser = TPartialUser & {
    cliente: string;
    postazione: string;
}
export type GenericResponse = {
    readonly success: boolean;
    readonly msg: string;
    readonly data: any;
};

export type FetchResponse = GenericResponse & { readonly filters: any[] };

export type ErrResponse = {
    readonly success: false;
    readonly msg: string;
    readonly data?: null;
};
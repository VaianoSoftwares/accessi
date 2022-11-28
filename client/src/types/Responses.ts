export type GenericResponse = {
    readonly success: boolean;
    readonly msg: string;
    readonly data: unknown;
    readonly filter?: unknown[];
};

export type OkResponse = GenericResponse & {
    readonly success: true;
}

export type ErrResponse = GenericResponse & {
    readonly success: false;
    readonly data?: null;
};
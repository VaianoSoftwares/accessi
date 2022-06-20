export type GenericResponse = {
    readonly success: boolean;
    readonly msg: string;
    readonly data: any;
    readonly filter?: any[];
};

export type ErrResponse = {
    readonly success: false;
    readonly msg: string;
    readonly data: null;
    readonly filters?: any[];
};
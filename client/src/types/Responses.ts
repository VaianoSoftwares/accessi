export type GenericResponse = {
    readonly success: boolean;
    readonly msg?: string;
    readonly data?: any;
    readonly filters?: any;
};

export type FetchOkResponse = {
    readonly success: true;
    readonly data: any;
    readonly filters: any;
};

export type FetchErrResponse = {
    readonly success: false;
    readonly msg: string;
    readonly data: any;
    readonly filters: any;
};

export type OkResponse = {
    readonly success: true;
    readonly msg: string;
    readonly data: any;
};

export type ErrResponse = {
    readonly success: false;
    readonly msg: string;
};
export type GenericResponse = {
    success: boolean;
    msg: string;
    data?: unknown;
    filters?: qs.ParsedQs;
};
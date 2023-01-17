import { Nullable } from "./Nullable";

type TPartialDoc = {
    codice: string;
    azienda: string;
    nome: string;
    cognome: string;
};

export type TDocumento = TPartialDoc & {
    filename: string;
};

export type DocFormState = TPartialDoc & {
    docimg: Nullable<File>;
};
import { Nullable } from "./Nullable";

export type DocFormState = {
    codice: string;
    azienda: string;
    nome: string;
    cognome: string;
    docimg: Nullable<File>;
};
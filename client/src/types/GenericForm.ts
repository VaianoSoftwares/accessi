import { Nullable } from "./Nullable";

export type GenericForm = Record<string, any | Nullable<File>>;
export type SimpleForm = Record<string, string | Nullable<File>>;
export type StringForm = Record<string, string>
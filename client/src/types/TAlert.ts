import { GenericResponse } from "./Responses";
export type TAlert = Required<Omit<GenericResponse, "filters" | "data">>;
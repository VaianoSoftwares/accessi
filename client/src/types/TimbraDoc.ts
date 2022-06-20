import { TipoBadge } from "../enums/TipoBadge";
import { OspFormState } from "./OspFormState";
export type TimbraDoc = OspFormState 
    & { cliente: string, postazione: string, tipo: TipoBadge };
import { TipoBadge } from "../enums/TipoBadge";
import { OspFormState } from "./OspFormState";
export type TimbraDoc = OspFormState 
    & { postazione: string, tipo: TipoBadge };
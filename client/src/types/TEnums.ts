import { TBadgeStato, TBadgeTipo, TTDoc } from "./Badge";
import { TAssegnaz } from "./TAssegnaz";

export type TEnums = {
    badge: TBadgeTipo[],
    stato: TBadgeStato[],
    documento: TTDoc[],
    assegnazione: TAssegnaz[]
};
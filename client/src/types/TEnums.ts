import { TBadgeStato, TBadgeTipo, TTDoc } from "./Badge";
import { TAssegnazione } from "./TAssegnazione";
import { TPostazione } from "./TPostazione";

export type TEnums = {
    badge: TBadgeTipo[],
    stato: TBadgeStato[],
    documento: TTDoc[],
    assegnazione: TAssegnazione[],
    cliente: string[],
    postazione: TPostazione[],
};
import { TBadgeStato, TBadgeTipo, TTDoc } from "./badges.js";

export type TAssegnaz = {
    badge: TBadgeTipo,
    name: string
};

export type TEnums = {
    badge: TBadgeTipo[],
    stato: TBadgeStato[],
    documento: TTDoc[],
    assegnazione: TAssegnaz[]
};
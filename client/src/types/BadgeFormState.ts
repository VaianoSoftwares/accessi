import { TBadgeResp } from "./Badge";
import { Nullable } from "./Nullable";

export type BadgeFormState = TBadgeResp & { pfp: Nullable<File> };
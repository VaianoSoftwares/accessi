import { TBadgeResp } from "./Badge";

export type BadgeFormState = Partial<
  TBadgeResp & {
    pfp: string;
    postazione: string;
  }
>;
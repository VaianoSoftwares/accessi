import { TBadge, TNominativo } from "./Badge";
import { Nullable } from "./Nullable";

export type BadgeFormState = Omit<TBadge, "nominativo"> &
  Omit<Required<TNominativo>, "targhe"> & {
    pfp: Nullable<File>;
    targa1: string;
    targa2: string;
    targa3: string;
    targa4: string;
  };
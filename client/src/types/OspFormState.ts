import { TBadge, TNominativo } from "./Badge";

export type OspFormState = Pick<TBadge, "barcode"> &
  Partial<Omit<TNominativo, "scadenza" | "targhe">> & {
    targa1?: string;
    targa2?: string;
    targa3?: string;
    targa4?: string;
  };
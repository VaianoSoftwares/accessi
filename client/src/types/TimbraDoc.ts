import { ArchivioElem } from "./ArchivioElem";
import { TBadge } from "./Badge";
import { OspFormState } from "./OspFormState";
export type TimbraDoc = OspFormState &
  Pick<ArchivioElem, "cliente" | "postazione"> &
  Pick<TBadge, "tipo">;
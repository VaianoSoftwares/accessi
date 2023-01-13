import { BadgeFormState } from "./BadgeFormState";

export type OspFormState = BadgeFormState & {
  descrizione: "PROVVISORIO",
  tipo: "PROVVISORIO",
  stato: "VALIDO",
  assegnazione: "OSPITE",
  ubicazione: "",
}
import { Badge } from "./badges.js";
import { BasePerson } from "./people.js";

export interface BaseChiave {
  indirizzo: string | null;
  edificio: string | null;
  citta: string | null;
  piano: string | null;
}

export type Chiave = BaseChiave & Badge;

export type ChiaveNominativo = Chiave & BasePerson;

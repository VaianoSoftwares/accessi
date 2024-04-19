import { Badge } from "./badges.js";
import { WithId } from "./index.js";
import { Person } from "./people.js";

export interface BaseVeicolo {
  targa: string;
  tipo: string;
}

export type Veicolo = WithId<
  BaseVeicolo & Omit<Badge, "codice" | "ubicazione">
>;

export type VeicoloNominativo = Veicolo &
  Person & { person_id: number; vehicle_id: number };

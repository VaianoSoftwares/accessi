import { BaseChiave } from "./chiavi.js";
import { WithId } from "./index.js";
import { BasePerson } from "./people.js";
import { BaseVeicolo } from "./veicoli.js";

export enum BarcodePrefix {
  nominativoIn = "01",
  nominativoOut = "11",
  provvisorioIn = "02",
  provvisorioOut = "12",
  chiaveIn = "03",
  chiaveOut = "13",
  veicoloIn = "04",
  veicoloOut = "14",
  nominativoGenerico = "1",
  provvisorioGenerico = "2",
  chiaveGenerico = "3",
  veicoloGenerico = "4",
}

export interface BaseArchivio {
  data_in: string;
  data_out: string;
  username: string;
  ip: string;
  post_id: number;
}

export interface BaseArchivioBadge extends BaseArchivio {
  badge: string;
}
export interface BaseArchivioVeicolo extends BaseArchivio {
  vehicle_id: number;
}
export interface BaseArchivioChiave extends BaseArchivio {
  badge: string;
  chiave: string;
}

export type BaseArchivioBadgeProv = BaseArchivio &
  Partial<Omit<BasePerson, "scadenza">> & { badge: string };
export type BaseArchivioVeicoloProv = BaseArchivio &
  Partial<Omit<BasePerson, "scadenza">> &
  Pick<BaseVeicolo, "targa"> & { tveicolo: string };

export type ArchivioBadge = WithId<BaseArchivioBadge>;
export type ArchivioVeicolo = WithId<BaseArchivioVeicolo>;
export type ArchivioChiave = WithId<BaseArchivioChiave>;
export type ArchivioBadgeProv = WithId<BaseArchivioBadgeProv>;
export type ArchivioVeicoloProv = WithId<BaseArchivioVeicoloProv>;

export type Archivio = Omit<BaseArchivio, "post_id"> &
  BasePerson &
  BaseChiave & {
    badge: string;
    veicolo: string;
    chiave: string;
    tipo: string;
    provvisorio: string;
    notte: string;
    cliente: string;
    postazione: string;
    tveicolo: string;
  };

export type BadgeInStrutt = WithId<
  Pick<BasePerson, "nome" | "cognome" | "assegnazione" | "ditta"> & {
    codice: string;
    cliente: string;
    postazione: string;
    data_in: string;
  }
>;
export type VeicoloInStrutt = WithId<
  Pick<BasePerson, "nome" | "cognome" | "assegnazione" | "ditta"> & {
    targa: string;
    tveicolo: string;
    cliente: string;
    postazione: string;
    data_in: string;
  }
>;

export type FullBadgeInStrutt = BadgeInStrutt &
  BasePerson & { post_id: number };
export type FullVeicoloInStrutt = VeicoloInStrutt &
  BasePerson & { post_id: number };

export type TimbraChiaviData = Pick<
  BaseArchivio,
  "post_id" | "ip" | "username"
> & {
  badge: string;
  chiavi: string[];
};

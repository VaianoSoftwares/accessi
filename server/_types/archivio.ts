import { QueryResult } from "pg";
import { BaseNominativo, BaseChiave, BaseVeicolo } from "./badges.js";

export interface BaseArchivio {
  badge: string;
  postazione: number;
  data_in: string | null;
  data_out: string | null;
  ip: string;
}

export enum BarcodePrefix {
  provvisorioEntra = "00",
  provvisorioEsce = "10",
  nominativoEntra = "01",
  nominativoEsce = "11",
  chiaveEntra = "02",
  chiaveEsce = "12",
  veicoloEntra = "03",
  veicoloEsce = "13",
}

export type ArchNomInsertData = BaseArchivio;
export type ArchChiaveInsertData = BaseArchivio & { chiave: string };
export type ArchVeicoloInsertData = BaseArchivio;
export type ArchProvInsertData = Omit<BaseArchivio, "data_in" | "data_out"> &
  Partial<Omit<BaseNominativo, "ndoc" | "tdoc">> & {
    ndoc: string;
    tdoc: string;
  };

export type ArchivioNominativo = BaseArchivio & BaseNominativo & { id: number };
export type ArchivioProvvisorio = ArchivioNominativo;
export type ArchivioVeicolo = ArchivioNominativo & BaseVeicolo;
export type ArchivioChiave = ArchivioNominativo &
  BaseChiave & { chiave: string };

export type Archivio = ArchivioNominativo & ArchivioVeicolo & ArchivioChiave;
export type ArchivioFilter = Partial<Archivio> & {
  tipo?: string | null | undefined;
  data_in_min?: string | null | undefined;
  data_in_max?: string | null | undefined;
  data_out_min?: string | null | undefined;
  data_out_max?: string | null | undefined;
};
export type InStruttFilter = Partial<ArchivioNominativo & ArchivioVeicolo> & {
  tipo?: string | null | undefined;
  tipi?: string[] | null | undefined;
  postazioni?: number[] | null | undefined;
  data_in_min?: string | null | undefined;
  data_in_max?: string | null | undefined;
};
export type InPrestitoFilter = Partial<ArchivioChiave> & {
  postazioni?: number[] | null | undefined;
  data_in_min?: string | null | undefined;
  data_in_max?: string | null | undefined;
};

export type TimbraNomData = Omit<BaseArchivio, "data_in" | "data_out">;
export type TimbraVeicoloData = TimbraNomData;
export type TimbraChiaveData = TimbraNomData & {
  chiave: string;
};
export type TimbraChiaviData = TimbraNomData & { chiavi: string[] };

export type TimbraChiaviRes = {
  in: QueryResult<ArchivioChiave>[];
  out: QueryResult<ArchivioChiave>[];
};

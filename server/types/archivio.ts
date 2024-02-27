import { QueryResult } from "pg";
import { BaseNominativo, BaseChiave, BaseVeicolo } from "./badges.js";
import { FindInStruttFilter } from "../utils/validation.js";

export interface BaseArchivio {
  badge: string;
  postazione: number;
  data_in: string;
  data_out: string;
  ip: string;
}

export enum BarcodePrefix {
  nominativoEntra = "00",
  nominativoEsce = "10",
  provvisorioEntra = "01",
  provvisorioEsce = "11",
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
// export type InStruttFilter = Partial<ArchivioNominativo & ArchivioVeicolo> & {
//   tipo?: string | null | undefined;
//   tipi?: string[] | null | undefined;
//   postazioni?: number[] | null | undefined;
//   data_in_min?: string | null | undefined;
//   data_in_max?: string | null | undefined;
// };
// export type InPrestitoFilter = Partial<ArchivioChiave> & {
//   postazioni?: number[] | null | undefined;
//   data_in_min?: string | null | undefined;
//   data_in_max?: string | null | undefined;
// };

export type TimbraBadgeData = Omit<BaseArchivio, "data_in" | "data_out">;
export type TimbraChiaveData = TimbraBadgeData & {
  chiave: string;
};
export type TimbraChiaviData = TimbraBadgeData & { chiavi: string[] };
export type TimbraUniData = Omit<TimbraBadgeData, "badge"> & { ndoc: string };

export type TimbraChiaviRes = {
  in: QueryResult<ArchivioChiave>[];
  out: QueryResult<ArchivioChiave>[];
};

export type InStrutt = Omit<
  Required<FindInStruttFilter>,
  "badge" | "tipi" | "data_in_min" | "data_in_max"
>;

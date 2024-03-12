import { QueryResult } from "pg";
import { BaseNominativo, BaseChiave, BaseVeicolo } from "./badges.js";
import { FindInStruttFilter } from "../utils/validation.js";
import { WithId } from "./index.js";
import { UploadedFile } from "express-fileupload";

export interface BaseArchivio {
  badge: string;
  postazione: number;
  data_in: string;
  data_out: string;
  username: string;
  ip: string;
}

export enum BarcodePrefix {
  nominativoEntra = "01",
  nominativoEsce = "11",
  provvisorioEntra = "02",
  provvisorioEsce = "12",
  chiaveEntra = "03",
  chiaveEsce = "13",
  veicoloEntra = "04",
  veicoloEsce = "14",
  nominativoGenerico = "1",
  provvisorioGenerico = "2",
  chiaveGenerico = "3",
  veicoloGenerico = "4",
}

export type ArchNomInsertData = BaseArchivio;
export type ArchChiaveInsertData = BaseArchivio & { chiave: string };
export type ArchVeicoloInsertData = BaseArchivio;
export type ArchProvInsertData = Omit<BaseArchivio, "data_in" | "data_out"> &
  Partial<Omit<BaseNominativo, "ndoc" | "tdoc">> & {
    ndoc: string;
    tdoc: string;
  };

export type ArchivioNominativo = WithId<BaseArchivio>;
export type ArchivioChiave = ArchivioNominativo & { chiave: string };
export type ArchivioVeicolo = ArchivioNominativo;
export type ArchivioProvvisorio = ArchivioNominativo & BaseNominativo;

export type Archivio = ArchivioNominativo &
  ArchivioVeicolo &
  ArchivioChiave &
  ArchivioProvvisorio &
  BaseChiave &
  BaseVeicolo & { cliente: string; postazione_id: number };

// export type ArchivioFilter = Partial<Archivio> & {
//   tipo?: string | null | undefined;
//   data_in_min?: string | null | undefined;
//   data_in_max?: string | null | undefined;
//   data_out_min?: string | null | undefined;
//   data_out_max?: string | null | undefined;
// };

export type TimbraBadgeData = Omit<BaseArchivio, "data_in" | "data_out">;
export type TimbraChiaviData = TimbraBadgeData & { chiavi: string[] };
export type TimbraUniData = Omit<TimbraBadgeData, "badge"> & { ndoc: string };
export type TimbraProvEntraData = TimbraBadgeData & {
  documento?: UploadedFile | undefined;
};

export type InStrutt = Omit<
  Required<FindInStruttFilter>,
  "badge" | "tipi" | "data_in_min" | "data_in_max"
>;

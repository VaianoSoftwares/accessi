import { BaseBadge, BaseChiave, BaseNominativo } from "./badges.js";
import { WithId } from "./index.js";

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
  mazzoChiavi = "5",
}

export enum MarkType {
  inOut = 1 << 0,
  pause = 1 << 1,
}

export function checkMarkType(n: number, ones: number[], zeros: number[]) {
  const onesMask = ones.reduce((m, b) => m | b, 0);
  const zerosMask = zeros.reduce((m, b) => m | b, 0);
  return !((n & onesMask) ^ onesMask) && !(n & zerosMask);
}

export interface BaseArchivio {
  created_at: string;
  mark_type: number;
  username: string;
  ip: string;
  post_id: number;
}

export interface BaseArchivioBadge extends BaseArchivio {
  badge_cod: string;
}
export interface BaseArchivioVeicolo extends BaseArchivio {
  targa: string;
}
export interface BaseArchivioChiave extends BaseArchivioBadge {
  chiave_cod: string;
  person_id: number;
}

export type BaseArchivioBadgeProv = BaseArchivioBadge & BaseNominativo;
export type BaseArchivioVeicoloProv = BaseArchivioVeicolo &
  BaseNominativo & { tveicolo: string };

export type ArchivioNominativo = WithId<BaseArchivioBadge>;
export type ArchivioVeicolo = WithId<BaseArchivioVeicolo>;
export type ArchivioChiave = WithId<BaseArchivioChiave>;
export type ArchivioProvvisorio = WithId<BaseArchivioBadgeProv>;
export type ArchivioVeicoloProv = WithId<BaseArchivioVeicoloProv>;

export type Archivio = WithId<
  Omit<BaseArchivio, "post_id"> &
    BaseNominativo &
    BaseChiave & {
      badge: string;
      targa: string;
      chiave: string;
      tipo: string;
      provvisorio: string;
      notte: string;
      cliente: string;
      postazione: string;
      tveicolo: string;
    }
>;

export type BadgeInStrutt = WithId<
  Pick<BaseNominativo, "nome" | "cognome" | "assegnazione" | "ditta"> &
    Pick<BaseArchivio, "created_at"> &
    Pick<BaseBadge, "codice" | "cliente"> & {
      postazione: string;
    }
>;
export type VeicoloInStrutt = WithId<
  Pick<BaseNominativo, "nome" | "cognome" | "assegnazione" | "ditta"> &
    Pick<BaseArchivioVeicoloProv, "targa" | "created_at" | "tveicolo"> &
    Pick<BaseBadge, "cliente"> & {
      postazione: string;
    }
>;

export type FullBadgeInStrutt = BadgeInStrutt &
  BaseNominativo & { post_id: number; mark_type: number };
export type FullVeicoloInStrutt = VeicoloInStrutt &
  BaseNominativo & { post_id: number };

export type TimbraChiaviData = Pick<
  BaseArchivio,
  "post_id" | "ip" | "username"
> & {
  badge_cod: string;
  chiavi: string[];
};
export type TimbraChiaviNoBadgeData = Omit<TimbraChiaviData, "badge_cod"> & {
  nome?: string;
  cognome?: string;
  assegnazione?: string;
  ditta?: string;
  cod_fisc?: string;
  ndoc?: string;
  tdoc?: string;
  telefono?: string;
};
export type TimbraChiaviProvData = TimbraChiaviNoBadgeData &
  Pick<TimbraChiaviData, "badge_cod">;

export type Tracciato = {
  zuc_cod: string;
  created_at: string | Date;
  formatted_date: string;
  markType: string;
};

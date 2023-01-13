import { TBadgeResp } from "./Badge";

export type TInStruttResp = Pick<
  TBadgeResp,
  "tipo" | "nome" | "cognome" | "ditta"
> & {
  codice: string;
  cliente: string;
  postazione: string;
  assegnaz: string;
  entrata: string;
};

export type TArchivioResp = TInStruttResp & { ip: string; uscita: string };

export type TTimbraResp = {
    timbra: TInStruttResp,
    badge: TBadgeResp,
    msg: string
};
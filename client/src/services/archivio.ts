import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import {
  FindInPrestitoData,
  FindBadgeInStrutt,
  FindBadgeInStruttData,
  PrestitoChiaviData,
  PrestitoChiaviRes,
  QueryInPrestito,
  QueryBadgeInStrutt,
  TimbraBadgeDoc,
  TimbraBadgeRes,
  TimbraVeicoloDoc,
  FindVeicoloInStruttData,
  QueryVeicoloInStrutt,
  FindVeicoloInStrutt,
  TimbraVeicoloRes,
} from "../types/archivio";

class ArchivioDataService extends DataServices {
  getArchivio(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<object[]>({
      token: true,
      data: query,
      signal,
    });
  }

  getBadgesInStrutt(
    query?: FindBadgeInStruttData,
    signal?: GenericAbortSignal
  ) {
    return super.request<QueryBadgeInStrutt[]>({
      url: "/in-struttura/badges",
      token: true,
      data: query,
      signal,
    });
  }

  getVeicoliInStrutt(
    query?: FindVeicoloInStruttData,
    signal?: GenericAbortSignal
  ) {
    return super.request<QueryVeicoloInStrutt[]>({
      url: "/in-struttura/veicoli",
      token: true,
      data: query,
      signal,
    });
  }

  findBadgesInStrutt(data: FindBadgeInStruttData, signal?: GenericAbortSignal) {
    return super.request<FindBadgeInStrutt[]>({
      url: "/in-struttura/badges",
      token: true,
      data,
      signal,
    });
  }

  findVeicoliInStrutt(
    data: FindVeicoloInStruttData,
    signal?: GenericAbortSignal
  ) {
    return super.request<FindVeicoloInStrutt[]>({
      url: "/in-struttura/veicoli",
      token: true,
      data,
      signal,
    });
  }

  getInPrestito(query: FindInPrestitoData, signal?: GenericAbortSignal) {
    return super.request<QueryInPrestito[]>({
      url: "/in-prestito",
      token: true,
      signal,
      data: query,
    });
  }

  timbraBadge(data: TimbraBadgeDoc, signal?: GenericAbortSignal) {
    return super.request<TimbraBadgeRes>({
      method: "POST",
      url: "/timbra/badge",
      token: true,
      data,
      signal,
    });
  }

  timbraVeicolo(data: TimbraVeicoloDoc, signal?: GenericAbortSignal) {
    return super.request<TimbraVeicoloRes>({
      method: "POST",
      url: "/timbra/veicolo",
      token: true,
      data,
      signal,
    });
  }

  prestaChiavi(data: PrestitoChiaviData, signal?: GenericAbortSignal) {
    return super.request<PrestitoChiaviRes>({
      method: "POST",
      url: "/timbra/chiavi",
      token: true,
      data,
      signal,
    });
  }

  insertBadgeArchProv(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/insert-provvisorio/badge",
      token: true,
      files: true,
      data,
      signal,
    });
  }

  insertVeicoloArchProv(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/insert-provvisorio/veicolo",
      token: true,
      files: true,
      data,
      signal,
    });
  }
}

export default new ArchivioDataService("/api/v1/archivio");

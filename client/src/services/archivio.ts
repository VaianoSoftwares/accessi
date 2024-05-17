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
import { GetResocontoForm } from "../types/forms";

class ArchivioDataService extends DataServices {
  getArchivio(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<object[]>({
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
      data: query,
      signal,
    });
  }

  findBadgesInStrutt(data: FindBadgeInStruttData, signal?: GenericAbortSignal) {
    return super.request<FindBadgeInStrutt[]>({
      url: "/in-struttura/badges",
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
      data,
      signal,
    });
  }

  getInPrestito(query: FindInPrestitoData, signal?: GenericAbortSignal) {
    return super.request<QueryInPrestito[]>({
      url: "/in-prestito",
      signal,
      data: query,
    });
  }

  timbraBadge(data: TimbraBadgeDoc, signal?: GenericAbortSignal) {
    return super.request<TimbraBadgeRes>({
      method: "POST",
      url: "/timbra/badge",
      data,
      signal,
    });
  }

  timbraVeicolo(data: TimbraVeicoloDoc, signal?: GenericAbortSignal) {
    return super.request<TimbraVeicoloRes>({
      method: "POST",
      url: "/timbra/veicolo",
      data,
      signal,
    });
  }

  prestaChiavi(data: PrestitoChiaviData, signal?: GenericAbortSignal) {
    return super.request<PrestitoChiaviRes>({
      method: "POST",
      url: "/timbra/chiavi",
      data,
      signal,
    });
  }

  insertBadgeArchProv(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/insert-provvisorio/badge",
      files: true,
      data,
      signal,
    });
  }

  insertVeicoloArchProv(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/insert-provvisorio/veicolo",
      files: true,
      data,
      signal,
    });
  }

  getResoconto(data: GetResocontoForm, signal?: GenericAbortSignal) {
    return super.request({
      url: "/resoconto",
      data,
      signal,
    });
  }
}

export default new ArchivioDataService("/api/v1/archivio");

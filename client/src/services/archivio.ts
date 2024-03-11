import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import {
  FindInPrestitoData,
  FindInStrutt,
  FindInStruttData,
  InsertArchProvData,
  PrestitoChiaviData,
  PrestitoChiaviRes,
  QueryInPrestito,
  QueryInStrutt,
  TimbraDoc,
  TimbraRes,
} from "../types/archivio";

class ArchivioDataService extends DataServices {
  getArchivio(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<object[]>({
      token: true,
      data: query,
      signal,
    });
  }

  getInStrutt(query?: FindInStruttData, signal?: GenericAbortSignal) {
    return super.request<QueryInStrutt[]>({
      url: "/in-struttura",
      token: true,
      data: query,
      signal,
    });
  }

  findInStrutt(data: FindInStruttData, signal?: GenericAbortSignal) {
    return super.request<FindInStrutt[]>({
      url: "/in-struttura",
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

  timbraBadge(data: TimbraDoc, signal?: GenericAbortSignal) {
    return super.request<TimbraRes>({
      method: "POST",
      url: "/timbra/badge",
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

  insertArchProv(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/archivio",
      token: true,
      files: true,
      data,
      signal,
    });
  }
}

export default new ArchivioDataService("/api/v1/archivio");

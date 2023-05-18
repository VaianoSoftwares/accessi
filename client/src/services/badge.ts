import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import {
  TInStruttDataReq,
  TAssegnazione,
  TimbraDoc,
  TPrestitoDataReq,
  TGetPostazioniFilters,
  TAddPostazioneData,
  TDeletePostazioneData,
} from "../types";

class BadgesDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request({ token: true, data: query, signal });
  }

  insertBadge(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  updateBadge(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "PUT",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  deleteBadge(barcode: string, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      token: true,
      data: { barcode },
      signal,
    });
  }

  getEnums(signal?: GenericAbortSignal) {
    return super.request({ url: "/enums", signal });
  }

  getAssegnazioni(signal?: GenericAbortSignal) {
    return super.request({ url: "/assegnazioni", signal });
  }

  insertAssegnazione(data: TAssegnazione, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/assegnazioni",
      token: true,
      data,
      signal,
    });
  }

  deleteAssegnazione(data: TAssegnazione, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      url: "/assegnazioni",
      token: true,
      data,
      signal,
    });
  }

  getPostazioni(query?: TGetPostazioniFilters, signal?: GenericAbortSignal) {
    return super.request({ url: "/postazioni", data: query, signal });
  }

  insertPostazione(data: TAddPostazioneData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/postazioni",
      token: true,
      data,
      signal,
    });
  }

  deletePostazione(data: TDeletePostazioneData, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      url: `/postazioni/${data._id}`,
      token: true,
      signal,
    });
  }

  getClienti(signal?: GenericAbortSignal) {
    return super.request({ url: "/clienti", signal });
  }

  getArchivio(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request({
      url: "/archivio",
      token: true,
      data: query,
      signal,
    });
  }

  getInStrutt(query?: TInStruttDataReq, signal?: GenericAbortSignal) {
    return super.request({
      url: "/archivio/in-struttura",
      token: true,
      data: query,
      signal,
    });
  }

  timbra(data: TimbraDoc, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/archivio",
      token: true,
      data,
      signal,
    });
  }

  getArchivioChiavi(
    query: Record<string, string>,
    signal?: GenericAbortSignal
  ) {
    return super.request({
      url: "/archivio-chiavi",
      token: true,
      data: query,
      signal,
    });
  }

  getInPrestito(signal?: GenericAbortSignal) {
    return super.request({
      url: "/archivio-chiavi/in-prestito",
      token: true,
      signal,
    });
  }

  prestaChiavi(data: TPrestitoDataReq, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/archivio-chiavi",
      token: true,
      data,
      signal,
    });
  }
}

export default new BadgesDataService("/api/v1/badges");

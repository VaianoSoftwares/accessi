import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";
import {
  GetPostazioniFilters,
  InsertPostazioneData,
  Postazione,
} from "../types/postazioni";

class PostazioniDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Postazione[]>({ signal });
  }

  get(data: GetPostazioniFilters, signal?: GenericAbortSignal) {
    return super.request<Postazione[]>({ data, signal });
  }

  insert(data: InsertPostazioneData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      data,
      signal,
    });
  }

  delete(id: number, signal?: AbortSignal) {
    return super.request({
      signal,
      method: "DELETE",
      url: `/${id}`,
    });
  }
}

export default new PostazioniDataService("/api/v1/postazioni");

import { GenericAbortSignal } from "axios";
import {
  GetPostazioniFilters,
  InsertPostazioneData,
  Postazione,
} from "../types/badges";
import DataServices from "./DataServices";

class PostazioniDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Postazione[]>({ token: true, signal });
  }

  get(data: GetPostazioniFilters, signal?: GenericAbortSignal) {
    return super.request<Postazione[]>({ token: true, data, signal });
  }

  insert(data: InsertPostazioneData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      token: true,
      data,
      signal,
    });
  }

  delete(id: number, signal?: AbortSignal) {
    return super.request({
      token: true,
      signal,
      method: "DELETE",
      url: `/${id}`,
    });
  }
}

export default new PostazioniDataService("/api/v1/postazioni");

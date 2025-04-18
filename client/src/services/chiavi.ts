import {
  BadgeDeleteReq,
  Chiave,
  ChiaveWMazzoDescr,
  DeleteReqRetData,
  InsertReqRetData,
  UpdateReqRetData,
} from "../types/badges";
import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";

class ChiaviDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Chiave[]>({ signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Chiave[]>({ data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Chiave>>({
      method: "POST",
      data,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Chiave>>({
      url: `/${data.get("codice")}`,
      method: "PUT",
      data,
      signal,
    });
  }

  delete(data: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Chiave>>({
      url: `/${data.codice}`,
      method: "DELETE",
      signal,
    });
  }

  getEdifici(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/edifici", signal });
  }

  findWMazzoDescr(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<ChiaveWMazzoDescr[]>({
      url: "/w_mazzo_descr",
      data: query,
      signal,
    });
  }
}

export default new ChiaviDataService("/api/v1/chiavi");

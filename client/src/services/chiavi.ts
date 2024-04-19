import {
  Chiave,
  ChiaveDeleteReq,
  DeleteReqRetData,
  InsertReqRetData,
  UpdateReqRetData,
} from "../types/badges";
import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";

class ChiaviDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Chiave[]>({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Chiave[]>({ token: true, data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Chiave>>({
      method: "POST",
      token: true,
      data,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Chiave>>({
      url: `/${data.get("id")}`,
      method: "PUT",
      token: true,
      data,
      signal,
    });
  }

  delete(data: ChiaveDeleteReq, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Chiave>>({
      url: `/${data.codice}`,
      method: "DELETE",
      token: true,
      signal,
    });
  }

  getEdifici(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/edifici", signal });
  }
}

export default new ChiaviDataService("/api/v1/chiavi");

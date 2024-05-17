import {
  BadgeDeleteReq,
  DeleteReqRetData,
  InsertReqRetData,
  UpdateReqRetData,
  Veicolo,
} from "../types/badges";
import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";

class VeicoliDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Veicolo[]>({ signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Veicolo[]>({ data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Veicolo>>({
      method: "POST",
      data,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Veicolo>>({
      url: `/${data.get("codice")}`,
      method: "PUT",
      data,
      signal,
    });
  }

  delete(data: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Veicolo>>({
      url: `/${data.codice}`,
      method: "DELETE",
      signal,
    });
  }

  getTVeicoli(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/tveicoli", signal });
  }
}

export default new VeicoliDataService("/api/v1/veicoli");

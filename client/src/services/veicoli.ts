import {
  DeleteReqRetData,
  InsertReqRetData,
  UpdateReqRetData,
  Veicolo,
} from "../types/badges";
import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";

class VeicoliDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Veicolo[]>({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Veicolo[]>({ token: true, data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Veicolo>>({
      method: "POST",
      token: true,
      data,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Veicolo>>({
      url: `/${data.get("id")}`,
      method: "PUT",
      token: true,
      data,
      signal,
    });
  }

  delete(data: { id: number }, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Veicolo>>({
      url: `/${data.id}`,
      method: "DELETE",
      token: true,
      signal,
    });
  }

  getTVeicoli(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/tveicoli", signal });
  }
}

export default new VeicoliDataService("/api/v1/veicoli");

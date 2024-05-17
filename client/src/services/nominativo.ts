import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";
import {
  BadgeDeleteReq,
  DeleteReqRetData,
  InsertReqRetData,
  Nominativo,
  UpdateReqRetData,
} from "../types/badges";

class NominativoDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Nominativo[]>({ signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Nominativo[]>({ data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Nominativo>>({
      method: "POST",
      data,
      files: true,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Nominativo>>({
      url: `/${data.get("codice")}`,
      method: "PUT",
      data,
      files: true,
      signal,
    });
  }

  delete(data: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Nominativo>>({
      url: `/${data.codice}`,
      method: "DELETE",
      signal,
    });
  }

  getAssegnazioni(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/assegnazioni", signal });
  }
}

export default new NominativoDataService("/api/v1/nominativi");

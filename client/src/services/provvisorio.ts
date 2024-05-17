import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";
import {
  BadgeDeleteReq,
  DeleteReqRetData,
  InsertReqRetData,
  Provvisorio,
  UpdateReqRetData,
} from "../types/badges";

class ProvvisorioDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Provvisorio[]>({ signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Provvisorio[]>({ data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Provvisorio>>({
      method: "POST",
      data,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Provvisorio>>({
      url: `/${data.get("codice")}`,
      method: "PUT",
      data,
      signal,
    });
  }

  delete(data: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Provvisorio>>({
      url: `/${data.codice}`,
      method: "DELETE",
      signal,
    });
  }
}

export default new ProvvisorioDataService("/api/v1/provvisori");

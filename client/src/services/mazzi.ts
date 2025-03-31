import {
  BadgeDeleteReq,
  MazzoChiavi,
  DeleteReqRetData,
  InsertReqRetData,
  UpdateReqRetData,
} from "../types/badges";
import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";

class MazziChiaviDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<MazzoChiavi[]>({ signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<MazzoChiavi[]>({ data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<MazzoChiavi>>({
      method: "POST",
      data,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<MazzoChiavi>>({
      url: `/${data.get("codice")}`,
      method: "PUT",
      data,
      signal,
    });
  }

  delete(data: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<MazzoChiavi>>({
      url: `/${data.codice}`,
      method: "DELETE",
      signal,
    });
  }

  getFreeKeys(data: { cliente: string }, signal?: GenericAbortSignal) {
    return super.request<string[]>({
      url: "/free-keys",
      data,
      signal,
    });
  }
}

export default new MazziChiaviDataService("/api/v1/mazzi");

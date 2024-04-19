import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import { TAssegnazione } from "../types";
import {
  Badge,
  BadgeDeleteReq,
  DeleteReqRetData,
  InsertReqRetData,
  UpdateReqRetData,
} from "../types/badges";

class BadgesDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Badge[]>({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Badge[]>({ token: true, data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Badge>>({
      method: "POST",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Badge>>({
      url: `/${data.get("codice")}`,
      method: "PUT",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  delete(data: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Badge>>({
      url: `/${data.codice}`,
      method: "DELETE",
      token: true,
      signal,
    });
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

  _getAssegnazioni(signal?: GenericAbortSignal) {
    return super.request<TAssegnazione[]>({
      url: "/assegnazioni",
      signal,
    });
  }
}

export default new BadgesDataService("/api/v1/badges");

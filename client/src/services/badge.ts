import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import { TAssegnazione } from "../types";
import { Badge, BadgeDeleteReq, BadgeFormDataReq } from "../types/badges";

class BadgesDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Badge[]>({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Badge[]>({ token: true, data: query, signal });
  }

  insert({ data, tipoBadge }: BadgeFormDataReq, signal?: GenericAbortSignal) {
    return super.request({
      url: `/${tipoBadge}`,
      method: "POST",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  update({ data, tipoBadge }: BadgeFormDataReq, signal?: GenericAbortSignal) {
    return super.request({
      url: `/${tipoBadge}/${data.get("codice")}`,
      method: "PUT",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  delete({ data, tipoBadge }: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request({
      url: `/${tipoBadge}/${data.codice}`,
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

  getAssegnazioni(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/assegnazioni", signal });
  }

  getEdifici(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/edifici", signal });
  }

  getTVeicoli(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/tveicoli", signal });
  }

  _getAssegnazioni(signal?: GenericAbortSignal) {
    return super.request<TAssegnazione[]>({
      url: "/assegnazioni",
      signal,
    });
  }
}

export default new BadgesDataService("/api/v1/badges");

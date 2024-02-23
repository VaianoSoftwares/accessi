import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import { TAssegnazione } from "../types";
import { BadgeDeleteReq, BadgeFormDataReq } from "../types/badges";

class BadgesDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request({ token: true, data: query, signal });
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
      url: `/${tipoBadge}`,
      method: "PUT",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  delete({ data, tipoBadge }: BadgeDeleteReq, signal?: GenericAbortSignal) {
    return super.request({
      url: `/${tipoBadge}`,
      method: "DELETE",
      token: true,
      data,
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

import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import { TAssegnazione } from "../types";

class BadgesDataService extends DataServices {
  insertAssegnazione(data: TAssegnazione, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/assegnazioni",
      data,
      signal,
    });
  }

  deleteAssegnazione(data: TAssegnazione, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      url: "/assegnazioni",
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

import { TimbraDoc } from "../types/TimbraDoc";
import { TAssegnazione } from "../types/TAssegnazione";
import { TPrestitoDataReq } from "../types/PrestitoChiavi";
import DataServices from "./DataServices";

type TInStruttDataReq = {
  cliente?: string;
  postazione?: string;
};

class BadgesDataService extends DataServices {
  getAll() {
    return super.request({ token: true });
  }

  find(query: Record<string, string>) {
    return super.request({ token: true, data: query });
  }

  insertBadge(data: FormData) {
    return super.request({ method: "POST", token: true, data, files: true });
  }

  updateBadge(data: FormData) {
    return super.request({ method: "PUT", token: true, data, files: true });
  }

  deleteBadge(barcode: string) {
    return super.request({ method: "DELETE", token: true, data: { barcode } });
  }

  getEnums() {
    return super.request({ url: "/enums" });
  }

  insertAssegnazione(data: TAssegnazione) {
    return super.request({
      method: "POST",
      url: "/assegnazioni",
      token: true,
      data,
    });
  }

  deleteAssegnazione(data: TAssegnazione) {
    return super.request({
      method: "DELETE",
      url: "/assegnazioni",
      token: true,
      data,
    });
  }

  getArchivio(query: Record<string, string>) {
    return super.request({ url: "/archivio", token: true, data: query });
  }

  getInStrutt(query?: TInStruttDataReq) {
    return super.request({
      url: "/archivio/in-struttura",
      token: true,
      data: query,
    });
  }

  timbra(data: TimbraDoc) {
    return super.request({
      method: "POST",
      url: "/archivio",
      token: true,
      data,
    });
  }

  getArchivioChiavi(query: Record<string, string>) {
    return super.request({ url: "/archivio-chiavi", token: true, data: query });
  }

  getInPrestito() {
    return super.request({ url: "/archivio-chiavi/in-prestito", token: true });
  }

  prestaChiavi(data: TPrestitoDataReq) {
    return super.request({
      method: "POST",
      url: "/archivio-chiavi",
      token: true,
      data,
    });
  }
}

export default new BadgesDataService("/api/v1/badges");

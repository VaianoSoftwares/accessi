import { AxiosResponse } from "axios";
import http from "../http-common";
import { AssegnazFormState } from "../types/AssegnazFormState";
import { FindBadgeDoc } from "../types/FindBadgeDoc";
import { ErrResponse, FetchErrResponse, FetchOkResponse, OkResponse } from "../types/Responses";
import { TimbraDoc } from "../types/TimbraDoc";

class BadgesDataService {
  token!: string;

  getAll(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return http.get("/badges", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  find(query: FindBadgeDoc): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    if (
      Object.keys(query).length === 0 ||
      !Object.values(query).some((value) => value !== null)
    )
      return this.getAll();

    const params = Object.entries(query)
      .filter((elem) => elem[1])
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    console.log(params);
    return http.get(`/badges?${params}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  insertBadge(data: FormData): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return http.post("/badges", data, {
      headers: {
        "auth-token": this.token,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  updateBadge(data: FormData): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return http.put("/badges", data, {
      headers: {
        "auth-token": this.token,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  deleteBadge(barcode: string): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return http.delete(`/badges?barcode=${barcode}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getAssegnazioni(tipo: string = ""): Promise<AxiosResponse<FetchOkResponse | FetchOkResponse>> {
    return http.get(`/badges/assegnazioni?tipo=${tipo}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  insertAssegnazione(data: AssegnazFormState): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return http.post("/badges/assegnazioni", data, {
      headers: {
        "auth-token": this.token
      }
    });
  }

  deleteAssegnazione(data: AssegnazFormState): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return http.delete(`/badges/assegnazioni?tipo=${data.tipoBadge}&assegnaz=${data.assegnazione}`, {
      headers: {
        "auth-token": this.token
      }
    });
  }

  getTipiDoc(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return http.get("/badges/tipi-doc", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getStati(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return http.get("/badges/stati", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getTipiBadge(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return http.get("/badges/tipi", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getArchivio({ inizio = "", fine = "" }): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return http.get(`/badges/archivio?inizio=${inizio}&fine=${fine}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getInStrutt(tipo: string = ""): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return http.get(`/badges/archivio/in-struttura?tipo=${tipo}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  timbra(data: TimbraDoc): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return http.post("/badges/archivio", data, {
      headers: {
        "auth-token": this.token,
      },
    });
  }
}

export default new BadgesDataService();
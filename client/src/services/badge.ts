import { AxiosResponse } from "axios";
import axios from "axios";
//import http from "../http-common";
import { AssegnazFormState } from "../types/AssegnazFormState";
import { FindBadgeDoc } from "../types/FindBadgeDoc";
import { ErrResponse, FetchErrResponse, FetchOkResponse, OkResponse } from "../types/Responses";
import { TimbraDoc } from "../types/TimbraDoc";

class BadgesDataService {
  getAll(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return axios.get("/api/v1/badges", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
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
    return axios.get(`/api/v1/badges?${params}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  insertBadge(data: FormData): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return axios.post("/api/v1/badges", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token"),
        "Content-Type": "multipart/form-data",
      },
    });
  }

  updateBadge(data: FormData): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return axios.put("/api/v1/badges", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token"),
        "Content-Type": "multipart/form-data",
      },
    });
  }

  deleteBadge(barcode: string): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return axios.delete(`/api/v1/badges?barcode=${barcode}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token"),
      },
    });
  }

  getAssegnazioni(tipo: string = ""): Promise<AxiosResponse<FetchOkResponse | FetchOkResponse>> {
    return axios.get(`/api/v1/badges/assegnazioni?tipo=${tipo}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  insertAssegnazione(data: AssegnazFormState): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return axios.post("/api/v1/badges/assegnazioni", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token")
      }
    });
  }

  deleteAssegnazione(data: AssegnazFormState): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return axios.delete(`/api/v1/badges/assegnazioni?tipo=${data.tipoBadge}&assegnaz=${data.assegnazione}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token")
      }
    });
  }

  getTipiDoc(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return axios.get("/api/v1/badges/tipi-doc", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getStati(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return axios.get("/api/v1/badges/stati", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getTipiBadge(): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return axios.get("/api/v1/badges/tipi", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getArchivio({ inizio = "", fine = "" }): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return axios.get(`/api/v1/badges/archivio?inizio=${inizio}&fine=${fine}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getInStrutt(tipo: string = ""): Promise<AxiosResponse<FetchOkResponse | FetchErrResponse>> {
    return axios.get(`/api/v1/badges/archivio/in-struttura?tipo=${tipo}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  timbra(data: TimbraDoc): Promise<AxiosResponse<OkResponse | ErrResponse>> {
    return axios.post("/api/v1/badges/archivio", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }
}

export default new BadgesDataService();
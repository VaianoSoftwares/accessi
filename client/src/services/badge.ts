import { AxiosResponse } from "axios";
import axios from "axios";
import { FindBadgeDoc } from "../types/FindBadgeDoc";
import { GenericResponse, FetchResponse } from "../types/Responses";
import { TimbraDoc } from "../types/TimbraDoc";
import { FindArchivioDoc } from "../types/FindArchivioDoc";
import { Assegnazione } from "../types/Assegnazione";

class BadgesDataService {
  getAll(): Promise<AxiosResponse<FetchResponse>> {
    return axios.get("/api/v1/badges", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  find(query: FindBadgeDoc): Promise<AxiosResponse<FetchResponse>> {
    if (
      Object.keys(query).length === 0 ||
      !Object.values(query).some((value) => value !== null)
    )
      return this.getAll();

    const params = Object.entries(query)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    console.log(params);
    return axios.get(`/api/v1/badges?${params}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  insertBadge(data: FormData): Promise<AxiosResponse<GenericResponse>> {
    return axios.post("/api/v1/badges", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token"),
        "Content-Type": "multipart/form-data",
      },
    });
  }

  updateBadge(data: FormData): Promise<AxiosResponse<GenericResponse>> {
    return axios.put("/api/v1/badges", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token"),
        "Content-Type": "multipart/form-data",
      },
    });
  }

  deleteBadge(barcode: string): Promise<AxiosResponse<GenericResponse>> {
    return axios.delete(`/api/v1/badges?barcode=${barcode}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token"),
      },
    });
  }

  getEnums(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`/api/v1/badges/enums`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getAssegnazioni(tipo: string = ""): Promise<AxiosResponse<FetchResponse>> {
    return axios.get(`/api/v1/badges/assegnazioni?tipo=${tipo}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  insertAssegnazione(data: Assegnazione): Promise<AxiosResponse<GenericResponse>> {
    return axios.post("/api/v1/badges/assegnazioni", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token")
      }
    });
  }

  deleteAssegnazione(data: Assegnazione): Promise<AxiosResponse<GenericResponse>> {
    return axios.delete(`/api/v1/badges/assegnazioni?badge=${data.badge}&name=${data.name}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
        "admin-token": sessionStorage.getItem("admin-token")
      }
    });
  }

  getTipiDoc(): Promise<AxiosResponse<FetchResponse>> {
    return axios.get("/api/v1/badges/tipi-doc", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getStati(): Promise<AxiosResponse<FetchResponse>> {
    return axios.get("/api/v1/badges/stati", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getTipiBadge(): Promise<AxiosResponse<FetchResponse>> {
    return axios.get("/api/v1/badges/tipi", {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getArchivio(query: FindArchivioDoc): Promise<AxiosResponse<FetchResponse>> {
    const params = Object.entries(query)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    
    return axios.get(`/api/v1/badges/archivio?${params}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  getInStrutt(tipo: string = ""): Promise<AxiosResponse<FetchResponse>> {
    return axios.get(`/api/v1/badges/archivio/in-struttura?tipo=${tipo}`, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }

  timbra(data: TimbraDoc): Promise<AxiosResponse<GenericResponse>> {
    return axios.post("/api/v1/badges/archivio", data, {
      headers: {
        "guest-token": sessionStorage.getItem("guest-token"),
      },
    });
  }
}

export default new BadgesDataService();
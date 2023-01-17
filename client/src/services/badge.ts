import axios from "./axiosSetup";
import { AxiosResponse } from "axios";
import { GenericResponse } from "../types/Responses";
import { TimbraDoc } from "../types/TimbraDoc";
import { TAssegnaz } from "../types/TAssegnaz";
import { adminReqFileHeader, adminReqHeader, guestReqHeader } from "./dataServicesConfigs";
import { isQueryEmpty, queryToString } from "./dataServicesUtilis";
import { TPrestitoDataReq } from "../types/PrestitoChiavi";

type TInStruttDataReq = {
  cliente?: string,
  postazione?: string,
};

const baseUrl = "/api/v1/badges";

class BadgesDataService {
  getAll(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(baseUrl, {
      headers: guestReqHeader,
    });
  }

  find(query: Record<string, string>): Promise<AxiosResponse<GenericResponse>> {
    if (isQueryEmpty(query)) return this.getAll();

    const params = queryToString(query);
    // console.log(params);

    return axios.get(`${baseUrl}?${params}`, {
      headers: guestReqHeader,
    });
  }

  insertBadge(data: FormData): Promise<AxiosResponse<GenericResponse>> {
    return axios.post(baseUrl, data, {
      headers: adminReqFileHeader,
    });
  }

  updateBadge(data: FormData): Promise<AxiosResponse<GenericResponse>> {
    return axios.put(baseUrl, data, {
      headers: adminReqFileHeader,
    });
  }

  deleteBadge(barcode: string): Promise<AxiosResponse<GenericResponse>> {
    return axios.delete(`${baseUrl}?barcode=${barcode}`, {
      headers: adminReqHeader,
    });
  }

  getEnums(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}/enums`, {
      headers: guestReqHeader,
    });
  }

  getAssegnazioni(tipo: string = ""): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}/assegnazioni?tipo=${tipo}`, {
      headers: guestReqHeader,
    });
  }

  insertAssegnazione(data: TAssegnaz): Promise<AxiosResponse<GenericResponse>> {
    return axios.post(`${baseUrl}/assegnazioni`, data, {
      headers: adminReqHeader,
    });
  }

  deleteAssegnazione(data: TAssegnaz): Promise<AxiosResponse<GenericResponse>> {
    return axios.delete(
      `${baseUrl}/assegnazioni?badge=${data.badge}&name=${data.name}`,
      {
        headers: adminReqHeader,
      }
    );
  }

  getTipiDoc(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}/tipi-doc`, {
      headers: guestReqHeader,
    });
  }

  getStati(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}/stati`, {
      headers: guestReqHeader,
    });
  }

  getTipiBadge(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}/tipi`, {
      headers: guestReqHeader,
    });
  }

  getArchivio(query: Record<string, string>): Promise<AxiosResponse<GenericResponse>> {
    const params = queryToString(query);

    return axios.get(`${baseUrl}/archivio?${params}`, {
      headers: adminReqHeader,
    });
  }

  getInStrutt(query?: TInStruttDataReq): Promise<AxiosResponse<GenericResponse>> {
    const params = queryToString(query);

    return axios.get(`${baseUrl}/archivio/in-struttura?${params}`, {
      headers: guestReqHeader,
    });
  }

  timbra(data: TimbraDoc): Promise<AxiosResponse<GenericResponse>> {
    return axios.post(`${baseUrl}/archivio`, data, {
      headers: guestReqHeader,
    });
  }

  getArchivioChiavi(query: Record<string, string>): Promise<AxiosResponse<GenericResponse>> {
    const params = queryToString(query);

    return axios.get(`${baseUrl}/archivio-chiavi?${params}`, {
      headers: adminReqHeader,
    });
  }

  getInPrestito(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}/archivio-chiavi/in-prestito`, {
      headers: guestReqHeader,
    });
  }

  prestaChiavi(data: TPrestitoDataReq): Promise<AxiosResponse<GenericResponse>> {
    return axios.post(`${baseUrl}/archivio-chiavi`, data, {
      headers: guestReqHeader,
    });
  }
}

export default new BadgesDataService();
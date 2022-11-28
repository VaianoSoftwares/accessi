import axios from "./axiosSetup";
import { AxiosResponse } from "axios";
import { FindBadgeDoc } from "../types/FindBadgeDoc";
import { GenericResponse } from "../types/Responses";
import { TimbraDoc } from "../types/TimbraDoc";
import { FindArchivioDoc } from "../types/FindArchivioDoc";
import { TAssegnaz } from "../types/TAssegnaz";
import { adminReqFileHeader, adminReqHeader, guestReqHeader } from "./dataServicesConfigs";
import { isQueryEmpty, queryToString } from "./dataServicesUtilis";

const baseUrl = "/api/v1/badges";

class BadgesDataService {

  getAll(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(baseUrl, {
      headers: guestReqHeader,
    });
  }

  find(query: FindBadgeDoc): Promise<AxiosResponse<GenericResponse>> {
    if (isQueryEmpty(query))
      return this.getAll();

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
      headers: adminReqHeader
    });
  }

  deleteAssegnazione(data: TAssegnaz): Promise<AxiosResponse<GenericResponse>> {
    return axios.delete(`${baseUrl}/assegnazioni?badge=${data.badge}&name=${data.name}`, {
      headers: adminReqHeader
    });
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

  getArchivio(query: FindArchivioDoc): Promise<AxiosResponse<GenericResponse>> {
    const params = queryToString(query);
    
    return axios.get(`${baseUrl}/archivio?${params}`, {
      headers: guestReqHeader,
    });
  }

  getInStrutt(tipo: string = ""): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}/archivio/in-struttura?tipo=${tipo}`, {
      headers: guestReqHeader,
    });
  }

  timbra(data: TimbraDoc): Promise<AxiosResponse<GenericResponse>> {
    return axios.post(`${baseUrl}/archivio`, data, {
      headers: guestReqHeader,
    });
  }
  
}

export default new BadgesDataService();
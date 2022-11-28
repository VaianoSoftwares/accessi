import { AxiosResponse } from "axios";
import axios from "./axiosSetup";
import { GenericResponse } from "../types/Responses";
import { DocFormState } from "../types/Documento";
import { adminReqFileHeader, adminReqHeader, guestReqHeader } from "./dataServicesConfigs";
import { isQueryEmpty, queryToString } from "./dataServicesUtilis";

const baseUrl = "/api/v1/documenti";

class DocumentsDataService {

  getAll(): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(baseUrl, {
      headers: guestReqHeader,
    });
  }

  find(query: DocFormState): Promise<AxiosResponse<GenericResponse>> {
    if (isQueryEmpty(query))
      return this.getAll();

    const params = queryToString(query);
    // console.log(params);
    
    return axios.get(`${baseUrl}?${params}`, {
      headers: guestReqHeader,
    });
  }

  insertDoc(data: FormData): Promise<AxiosResponse<GenericResponse>> {
    return axios.post(baseUrl, data, {
      headers: adminReqFileHeader,
    });
  }

  updateDoc(data: FormData): Promise<AxiosResponse<GenericResponse>> {
    return axios.put(baseUrl, data, {
      headers: adminReqFileHeader,
    });
  }

  deleteDoc(codice: string): Promise<AxiosResponse<GenericResponse>> {
    return axios.delete(`${baseUrl}?codice=${codice}`, {
      headers: adminReqHeader,
    });
  }

}

export default new DocumentsDataService();

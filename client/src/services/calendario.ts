import axios from "./axiosSetup";
import { AxiosResponse } from "axios";
import { GenericResponse } from "../types/Responses";
import { adminReqFileHeader, adminReqHeader, guestReqHeader } from "./dataServicesConfigs";

const baseUrl = "/api/v1/calendario";

class CalendarioDataService {

  getFilenames(date: string): Promise<AxiosResponse<GenericResponse>> {
    return axios.get(`${baseUrl}?date=${date}`, {
      headers: guestReqHeader,
    });
  }

  insertFiles(data: FormData): Promise<AxiosResponse<GenericResponse>> {
    return axios.post(baseUrl, data, {
      headers: adminReqFileHeader,
    });
  }

  deleteFile(date: string, filename: string): Promise<AxiosResponse<GenericResponse>> {
    return axios.delete(`${baseUrl}?date=${date}&filename=${filename}`, {
      headers: adminReqHeader,
    });
  }

}

export default new CalendarioDataService();

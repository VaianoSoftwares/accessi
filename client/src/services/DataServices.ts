import axios from "./axiosSetup";
import { GenericForm } from "../types/GenericForm";
import { AxiosResponse, RawAxiosRequestHeaders } from "axios";
import { GenericResponse } from "../types/Responses";

type TAxiosResp = Promise<AxiosResponse<GenericResponse>>;

type TQueryMethod = "GET" | "DELETE";
type TFormDataMethod = "POST" | "PUT" | "PATCH";
type TMethod = TQueryMethod | TFormDataMethod;
type TReqData = GenericForm | FormData;

type TReqOptions = {
  url?: string;
  token?: boolean;
  files?: boolean;
  method?: TMethod;
  data?: TReqData;
};

export default abstract class DataServices {
  constructor(private readonly baseUrl: string) {}

  private isFormDataMethod(method: string): method is TFormDataMethod {
    return ["POST", "PUT", "PATCH"].includes(method);
  }

  private getHeaders(token = false, files = false) {
    const headers: RawAxiosRequestHeaders = {};
    token && (headers["x-access-token"] = sessionStorage.getItem("token"));
    files && (headers["Content-Type"] = "multipart/form-data");
    return headers;
  }

  private queryToString<T extends GenericForm>(query?: T) {
    return query
      ? "?" +
          Object.entries(query)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
      : "";
  }

  protected request({
    url = "",
    token = false,
    files = false,
    method = "GET",
    data,
  }: TReqOptions): TAxiosResp {
    const headers = this.getHeaders(token, files);

    const completeUrl =
      data instanceof FormData || this.isFormDataMethod(method)
        ? `${this.baseUrl}${url}`
        : `${this.baseUrl}${url}${this.queryToString(data)}`;

    switch (method) {
      case "GET":
        return axios.get(completeUrl, { headers });
      case "DELETE":
        return axios.delete(completeUrl, { headers });
      case "POST":
        return axios.post(completeUrl, data, { headers });
      case "PUT":
        return axios.put(completeUrl, data, { headers });
      case "PATCH":
        return axios.patch(completeUrl, data, { headers });
    }
  }
}
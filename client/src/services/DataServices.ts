import axios from "./axiosSetup";
import {
  AxiosResponse,
  GenericAbortSignal,
  RawAxiosRequestHeaders,
} from "axios";
import { GenericResponse, GenericForm } from "../types";

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
  signal?: GenericAbortSignal;
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
            .map(([key, value]) =>
              Array.isArray(value)
                ? `${key}=${value.join(`&${key}=`)}`
                : `${key}=${value}`
            )
            .join("&")
      : "";
  }

  protected request({
    url = "",
    token = false,
    files = false,
    method = "GET",
    data,
    signal = undefined,
  }: TReqOptions): TAxiosResp {
    const headers = this.getHeaders(token, files);

    const completeUrl =
      data instanceof FormData || this.isFormDataMethod(method)
        ? `${this.baseUrl}${url}`
        : `${this.baseUrl}${url}${this.queryToString(data)}`;

    switch (method) {
      case "GET":
        return axios.get(completeUrl, { headers, signal });
      case "DELETE":
        return axios.delete(completeUrl, { headers, signal });
      case "POST":
        return axios.post(completeUrl, data, { headers, signal });
      case "PUT":
        return axios.put(completeUrl, data, { headers, signal });
      case "PATCH":
        return axios.patch(completeUrl, data, { headers, signal });
    }
  }
}

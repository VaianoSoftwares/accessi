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

  private static isFormDataMethod(method: string): method is TFormDataMethod {
    return ["POST", "PUT", "PATCH"].includes(method);
  }

  private static getHeaders(token = false, files = false) {
    const headers: RawAxiosRequestHeaders = {};
    token &&
      (headers["x-access-token"] = JSON.parse(
        sessionStorage.getItem("user") || '{"token":""}'
      ).token);
    files && (headers["Content-Type"] = "multipart/form-data");
    return headers;
  }

  private static queryToString<T extends GenericForm>(query?: T) {
    return query
      ? "?" +
          Object.entries(query)
            .filter(([, value]) => value)
            .map(([key, value]) =>
              Array.isArray(value)
                ? `${key}[]=${value.join(`&${key}=`)}`
                : `${key}=${value}`
            )
            .join("&")
      : "";
  }

  protected async request({
    url = "",
    token = false,
    files = false,
    method = "GET",
    data,
    signal = undefined,
  }: TReqOptions): TAxiosResp {
    const headers = DataServices.getHeaders(token, files);

    const completeUrl =
      data instanceof FormData || DataServices.isFormDataMethod(method)
        ? `${this.baseUrl}${url}`
        : `${this.baseUrl}${url}${DataServices.queryToString(data)}`;

    switch (method) {
      case "GET":
        return await axios.get(completeUrl, { headers, signal });
      case "DELETE":
        return await axios.delete(completeUrl, { headers, signal });
      case "POST":
        return await axios.post(completeUrl, data, { headers, signal });
      case "PUT":
        return await axios.put(completeUrl, data, { headers, signal });
      case "PATCH":
        return await axios.patch(completeUrl, data, { headers, signal });
    }
  }
}

import axios from "./axiosSetup";
import {
  AxiosResponse,
  GenericAbortSignal,
  RawAxiosRequestHeaders,
} from "axios";
import { GenericForm, Result } from "../types";

type TAxiosResp<T = any> = Promise<AxiosResponse<Result<T>>>;

type TQueryMethod = "GET" | "DELETE";
type TFormDataMethod = "POST" | "PUT" | "PATCH";
type TMethod = TQueryMethod | TFormDataMethod;
type TReqData = GenericForm | FormData;

type TReqOptions = {
  url?: string;
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

  private static getHeaders(files = false) {
    const headers: RawAxiosRequestHeaders = {};
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

  protected async request<T = any>({
    url = "",
    files = false,
    method = "GET",
    data,
    signal = undefined,
  }: TReqOptions): TAxiosResp<T> {
    const headers = DataServices.getHeaders(files);

    const completeUrl =
      data instanceof FormData || DataServices.isFormDataMethod(method)
        ? `${this.baseUrl}${url}`
        : `${this.baseUrl}${url}${DataServices.queryToString(data)}`;

    switch (method) {
      case "GET":
        return await axios.get(completeUrl, {
          headers,
          signal,
          withCredentials: true,
        });
      case "DELETE":
        return await axios.delete(completeUrl, {
          headers,
          signal,
          withCredentials: true,
        });
      case "POST":
        return await axios.post(completeUrl, data, {
          headers,
          signal,
          withCredentials: true,
        });
      case "PUT":
        return await axios.put(completeUrl, data, {
          headers,
          signal,
          withCredentials: true,
        });
      case "PATCH":
        return await axios.patch(completeUrl, data, {
          headers,
          signal,
          withCredentials: true,
        });
    }
  }
}

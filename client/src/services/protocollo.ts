import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";
import { GenericForm } from "../types";
import { FullProtocollo } from "../types/protocolli";

class ProtocolloDataServices extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<FullProtocollo[]>({ token: true, signal });
  }

  find(query: GenericForm, signal?: GenericAbortSignal) {
    return super.request<FullProtocollo[]>({
      token: true,
      data: query,
      signal,
    });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      token: true,
      files: true,
      data,
      signal,
    });
  }

  delete(id: number, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      token: true,
      url: `/${id}`,
      signal,
    });
  }
}

export default new ProtocolloDataServices("/api/v1/protocolli");

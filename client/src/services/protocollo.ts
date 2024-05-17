import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";
import { GenericForm } from "../types";
import { FullProtocollo } from "../types/protocolli";

class ProtocolloDataServices extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<FullProtocollo[]>({ signal });
  }

  find(query: GenericForm, signal?: GenericAbortSignal) {
    return super.request<FullProtocollo[]>({
      data: query,
      signal,
    });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      files: true,
      data,
      signal,
    });
  }

  delete(id: number, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      url: `/${id}`,
      signal,
    });
  }
}

export default new ProtocolloDataServices("/api/v1/protocolli");

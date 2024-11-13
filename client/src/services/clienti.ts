import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";

class ClientiDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<string[]>({ signal });
  }

  insert(data: { name: string }, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      data,
      signal,
    });
  }

  delete(name: string, signal?: GenericAbortSignal) {
    return super.request({
      signal,
      method: "DELETE",
      url: `/${name}`,
    });
  }
}

export default new ClientiDataService("/api/v1/clienti");

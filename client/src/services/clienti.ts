import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";

class ClientiDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<string[]>({ token: true, signal });
  }

  insert(data: { cliente: string }, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      token: true,
      data,
      signal,
    });
  }

  delete(cliente: string, signal?: GenericAbortSignal) {
    return super.request({
      token: true,
      signal,
      method: "DELETE",
      url: `/${cliente}`,
    });
  }
}

export default new ClientiDataService("/api/v1/clienti");

import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";

class DocumentsDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request({ token: true, data: query, signal });
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

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request({
      method: "PUT",
      token: true,
      files: true,
      data,
      signal,
    });
  }

  delete(codice: string, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      token: true,
      data: { codice },
      signal,
    });
  }
}

export default new DocumentsDataService("/api/v1/documenti");

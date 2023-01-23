import { DocFormState } from "../types/Documento";
import DataServices from "./DataServices";

class DocumentsDataService extends DataServices {
  getAll() {
    return super.request({ token: true });
  }

  find(query: DocFormState) {
    return super.request({ token: true, data: query });
  }

  insert(data: FormData) {
    return super.request({ method: "POST", token: true, files: true, data });
  }

  update(data: FormData) {
    return super.request({ method: "PUT", token: true, files: true, data });
  }

  delete(codice: string) {
    return super.request({ method: "DELETE", token: true, data: { codice } });
  }
}

export default new DocumentsDataService("/api/v1/documenti");

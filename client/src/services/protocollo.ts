import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";
import { ProtocolloFindReq } from "../types";

class ProtocolloDataServices extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request({ token: true, signal });
  }

  find(query: ProtocolloFindReq, signal?: GenericAbortSignal) {
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

  delete(data: { id: string; filename: string }, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      token: true,
      data,
      signal,
    });
  }
}

export default new ProtocolloDataServices("/api/v1/protocollo");

import {
  DeleteReqRetData,
  InsertReqRetData,
  Person,
  UpdateReqRetData,
} from "../types/badges";
import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";

class PeopleDataService extends DataServices {
  getAll(signal?: GenericAbortSignal) {
    return super.request<Person[]>({ token: true, signal });
  }

  find(query: Record<string, string>, signal?: GenericAbortSignal) {
    return super.request<Person[]>({ token: true, data: query, signal });
  }

  insert(data: FormData, signal?: GenericAbortSignal) {
    return super.request<InsertReqRetData<Person>>({
      method: "POST",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  update(data: FormData, signal?: GenericAbortSignal) {
    return super.request<UpdateReqRetData<Person>>({
      url: `/${data.get("id")}`,
      method: "PUT",
      token: true,
      data,
      files: true,
      signal,
    });
  }

  delete(data: { id: number }, signal?: GenericAbortSignal) {
    return super.request<DeleteReqRetData<Person>>({
      url: `/${data.id}`,
      method: "DELETE",
      token: true,
      signal,
    });
  }

  getAssegnazioni(signal?: GenericAbortSignal) {
    return super.request<string[]>({ url: "/assegnazioni", signal });
  }
}

export default new PeopleDataService("/api/v1/people");

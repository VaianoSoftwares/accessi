import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import { RegisterFormState, LoginFormState, TPermesso } from "../types";

class UserDataService extends DataServices {
  register(data: RegisterFormState, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/register",
      token: true,
      data,
      signal,
    });
  }

  login(data: LoginFormState, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/login",
      data,
      signal,
    });
  }

  getUser(device: string, signal?: GenericAbortSignal) {
    return super.request({
      url: "/user",
      data: { device },
      signal,
    });
  }

  getPermessi(data?: Partial<TPermesso>, signal?: GenericAbortSignal) {
    return super.request({
      url: "/permessi",
      data,
      token: true,
      signal,
    });
  }

  postPermesso(data: TPermesso, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/permessi",
      token: true,
      data,
      signal,
    });
  }

  deletePermesso(_id: string, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      url: "/permessi",
      token: true,
      data: { _id },
      signal,
    });
  }
}

export default new UserDataService("/api/v1/users");

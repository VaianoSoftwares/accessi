import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import { RegisterFormState, LoginFormState, TPermesso, TUser } from "../types";

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

  deviceLogin(signal?: GenericAbortSignal) {
    return super.request({
      url: "/login/refresh",
      token: true,
      signal,
    });
  }

  getAllUsers(signal?: GenericAbortSignal) {
    return super.request({
      token: true,
      signal,
    });
  }

  getUser({ _id }: { _id: string }, signal?: GenericAbortSignal) {
    return super.request({
      url: `/user/${_id}`,
      token: true,
      signal,
    });
  }

  updateUser(
    { _id, user }: { _id: string; user: Partial<TUser> | FormData },
    signal?: GenericAbortSignal
  ) {
    return super.request({
      url: `/user/${_id}`,
      method: "POST",
      token: true,
      data: user,
      signal,
    });
  }

  deleteUser({ _id }: { _id: string }, signal?: GenericAbortSignal) {
    return super.request({
      url: `/user/${_id}`,
      method: "DELETE",
      token: true,
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

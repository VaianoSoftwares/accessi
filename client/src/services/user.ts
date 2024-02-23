import DataServices from "./DataServices";
import { GenericAbortSignal } from "axios";
import { TPermesso } from "../types";
import {
  InsertUserData,
  LoginUserData,
  TUser,
  UpdateUserData,
} from "../types/users";

class UserDataService extends DataServices {
  register(data: InsertUserData, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/register",
      token: true,
      data,
      signal,
    });
  }

  login(data: LoginUserData, signal?: GenericAbortSignal) {
    return super.request<TUser>({
      method: "POST",
      url: "/login",
      data,
      signal,
    });
  }

  deviceLogin(signal?: GenericAbortSignal) {
    return super.request<TUser>({
      url: "/login/refresh",
      token: true,
      signal,
    });
  }

  getAllUsers(signal?: GenericAbortSignal) {
    return super.request<TUser[]>({
      token: true,
      signal,
    });
  }

  getUser({ id }: { id: string }, signal?: GenericAbortSignal) {
    return super.request<TUser>({
      url: `/user/${id}`,
      token: true,
      signal,
    });
  }

  updateUser(
    { id, user }: { id: string; user: UpdateUserData },
    signal?: GenericAbortSignal
  ) {
    return super.request({
      url: `/user/${id}`,
      method: "POST",
      token: true,
      data: user,
      signal,
    });
  }

  deleteUser({ id }: { id: string }, signal?: GenericAbortSignal) {
    return super.request({
      url: `/user/${id}`,
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

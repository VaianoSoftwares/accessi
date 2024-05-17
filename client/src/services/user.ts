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

  logout(signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/logout",
      signal,
    });
  }

  deviceLogin(signal?: GenericAbortSignal) {
    return super.request<TUser>({
      method: "POST",
      url: "/login/refresh",
      signal,
    });
  }

  getAllUsers(signal?: GenericAbortSignal) {
    return super.request<TUser[]>({
      signal,
    });
  }

  getUser({ id }: { id: string }, signal?: GenericAbortSignal) {
    return super.request<TUser>({
      url: `/${id}`,
      signal,
    });
  }

  updateUser(
    { id, user }: { id: string; user: UpdateUserData },
    signal?: GenericAbortSignal
  ) {
    return super.request({
      url: `/${id}`,
      method: "PUT",
      data: user,
      signal,
    });
  }

  deleteUser({ id }: { id: string }, signal?: GenericAbortSignal) {
    return super.request({
      url: `/${id}`,
      method: "DELETE",
      signal,
    });
  }

  getPermessi(data?: Partial<TPermesso>, signal?: GenericAbortSignal) {
    return super.request({
      url: "/permessi",
      data,
      signal,
    });
  }

  postPermesso(data: TPermesso, signal?: GenericAbortSignal) {
    return super.request({
      method: "POST",
      url: "/permessi",
      data,
      signal,
    });
  }

  deletePermesso(_id: string, signal?: GenericAbortSignal) {
    return super.request({
      method: "DELETE",
      url: "/permessi",
      data: { _id },
      signal,
    });
  }
}

export default new UserDataService("/api/v1/users");

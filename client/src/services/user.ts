import { LoginFormState } from "../types/LoginFormState";
import { TPermesso } from "../types/TPermesso";
import { RegisterFormState } from "../types/RegisterFormState";
import DataServices from "./DataServices";

class UserDataService extends DataServices {
  register(data: RegisterFormState) {
    return super.request({
      method: "POST",
      url: "/register",
      token: true,
      data,
    });
  }

  login(data: LoginFormState) {
    return super.request({
      method: "POST",
      url: "/login",
      data,
    });
  }

  getUser(id: string) {
    return super.request({
      url: "/user",
      data: { id },
      token: true,
    });
  }

  logout() {
    return super.request({
      method: "POST",
      url: "/logout",
      token: true,
    });
  }

  getSession() {
    return super.request({
      url: "/session",
      token: true,
    });
  }

  getPermessi(data?: TPermesso) {
    return super.request({
      url: "/permessi",
      data,
      token: true,
    });
  }

  postPermesso(data: TPermesso) {
    return super.request({
      method: "POST",
      url: "/permessi",
      token: true,
      data,
    });
  }

  deletePermesso(data: TPermesso) {
    return super.request({
      method: "DELETE",
      url: "/permessi",
      token: true,
      data,
    });
  }
}

export default new UserDataService("/api/v1/users");

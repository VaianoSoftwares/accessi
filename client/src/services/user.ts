import axios, { AxiosResponse } from "axios";
//import http from "../http-common";
import { LoginFormState } from "../types/LoginFormState";
import { RegisterFormState } from "../types/RegisterFormState";

class UserDataService {
    register(data: RegisterFormState): Promise<AxiosResponse<any>> {
        return axios.post("/api/v1/users/register", data, {
            headers: {
                "guest-token": sessionStorage.getItem("guest-token"),
                "admin-token": sessionStorage.getItem("admin-token")
            }
        });
    }

    login(data: LoginFormState): Promise<AxiosResponse<any>> {
        return axios.post("/api/v1/users/login", data);
    }

    getTipiUtenti(): Promise<AxiosResponse<any>> {
        return axios.get("/api/v1/users/tipi-utenti", {
            headers: {
                "guest-token": sessionStorage.getItem("guest-token")
            }
        });
    }
}

export default new UserDataService();
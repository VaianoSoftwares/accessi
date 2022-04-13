import axios, { AxiosResponse } from "axios";
import { LoginFormState } from "../types/LoginFormState";
import { RegisterFormState } from "../types/RegisterFormState";
import { GenericResponse } from "../types/Responses";

class UserDataService {
    register(data: RegisterFormState): Promise<AxiosResponse<GenericResponse>> {
        return axios.post("/api/v1/users/register", data, {
            headers: {
                "guest-token": sessionStorage.getItem("guest-token"),
                "admin-token": sessionStorage.getItem("admin-token")
            }
        });
    }

    login(data: LoginFormState): Promise<AxiosResponse<GenericResponse>> {
        return axios.post("/api/v1/users/login", data);
    }

    getTipiUtenti(): Promise<AxiosResponse<GenericResponse>> {
        return axios.get("/api/v1/users/tipi-utenti", {
            headers: {
                "guest-token": sessionStorage.getItem("guest-token")
            }
        });
    }
}

export default new UserDataService();
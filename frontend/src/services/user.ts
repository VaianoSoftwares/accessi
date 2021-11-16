import { AxiosResponse } from "axios";
import http from "../http-common.js";
import { LoginFormState } from "../types/LoginFormState.js";
import { RegisterFormState } from "../types/RegisterFormState.js";

class UserDataService {
    token!: string;

    register(data: RegisterFormState): Promise<AxiosResponse<any>> {
        return http.post("/users/register", data, {
            headers: {
                "auth-token": this.token
            }
        });
    }

    login(data: LoginFormState): Promise<AxiosResponse<any>> {
        return http.post("/users/login", data);
    }

    getTipiUtenti(): Promise<AxiosResponse<any>> {
        return http.get("/users/tipi-utenti", {
            headers: {
                "auth-token": this.token
            }
        });
    }
}

export default new UserDataService();
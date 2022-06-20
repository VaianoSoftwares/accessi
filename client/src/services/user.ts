import axios, { AxiosResponse } from "axios";
import { LoginFormState } from "../types/LoginFormState";
import { Permesso } from "../types/Permesso";
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

    getPermessi(data?: Permesso): Promise<AxiosResponse<GenericResponse>> {
        const params = data && Object.entries(data)
            .filter(([key, value]) => value)
            .map(([key, value]) => `${key}=${value}`)
            .join("&");
        
        return axios.get(`/api/v1/users/permessi?${params}`, {
            headers: {
                "guest-token": sessionStorage.getItem("guest-token")
            }
        });
    }

    postPermesso(data: Permesso): Promise<AxiosResponse<GenericResponse>> {
        return axios.post("/api/v1/users/permessi", data, {
            headers: {
                "guest-token": sessionStorage.getItem("guest-token")
            }
        });
    }

    deletePermesso(data: Permesso): Promise<AxiosResponse<GenericResponse>> {
        const params = Object.entries(data)
            .filter(([key, value]) => value)
            .map(([key, value]) => `${key}=${value}`)
            .join("&");
        
        return axios.delete(`/api/v1/users/permessi?${params}`, {
            headers: {
                "guest-token": sessionStorage.getItem("guest-token"),
                "admin-token": sessionStorage.getItem("admin-token")
            }
        });
    }
}

export default new UserDataService();
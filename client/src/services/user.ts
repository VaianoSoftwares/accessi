import axios, { AxiosResponse } from "axios";
import { LoginFormState } from "../types/LoginFormState";
import { Permesso } from "../types/Permesso";
import { RegisterFormState } from "../types/RegisterFormState";
import { GenericResponse } from "../types/Responses";
import { adminReqHeader, guestReqHeader } from "./dataServicesConfigs";
import { queryToString } from "./dataServicesUtilis";

const baseUrl = "/api/v1/users";

class UserDataService {

    register(data: RegisterFormState): Promise<AxiosResponse<GenericResponse>> {
        return axios.post(`${baseUrl}/register`, data, {
            headers: adminReqHeader
        });
    }

    login(data: LoginFormState): Promise<AxiosResponse<GenericResponse>> {
        return axios.post(`${baseUrl}/login`, data);
    }

    getTipiUtenti(): Promise<AxiosResponse<GenericResponse>> {
        return axios.get(`${baseUrl}/tipi-utenti`, {
            headers: guestReqHeader
        });
    }

    getPermessi(data?: Permesso): Promise<AxiosResponse<GenericResponse>> {
        const params = queryToString(data);
        
        return axios.get(`${baseUrl}/permessi?${params}`, {
            headers: guestReqHeader
        });
    }

    postPermesso(data: Permesso): Promise<AxiosResponse<GenericResponse>> {
        return axios.post(`${baseUrl}/permessi`, data, {
            headers: guestReqHeader
        });
    }

    deletePermesso(data: Permesso): Promise<AxiosResponse<GenericResponse>> {
        const params = queryToString(data);
        
        return axios.delete(`${baseUrl}/permessi?${params}`, {
            headers: adminReqHeader
        });
    }
    
}

export default new UserDataService();
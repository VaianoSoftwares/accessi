import axios from "./axiosSetup";
import { AxiosResponse } from "axios";
import { LoginFormState } from "../types/LoginFormState";
import { TPermesso } from "../types/TPermesso";
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

    logout(): Promise<AxiosResponse<GenericResponse>> {
        return axios.post(`${baseUrl}/logout`, {}, {
            headers: guestReqHeader
        });
    }

    getSession(): Promise<AxiosResponse<GenericResponse>> {
        return axios.get(`${baseUrl}/session`, {
            headers: guestReqHeader
        });
    }

    getTipiUtenti(): Promise<AxiosResponse<GenericResponse>> {
        return axios.get(`${baseUrl}/tipi-utenti`, {
            headers: guestReqHeader
        });
    }

    getPermessi(data?: TPermesso): Promise<AxiosResponse<GenericResponse>> {
        const params = queryToString(data);
        
        return axios.get(`${baseUrl}/permessi?${params}`, {
            headers: guestReqHeader
        });
    }

    postPermesso(data: TPermesso): Promise<AxiosResponse<GenericResponse>> {
        return axios.post(`${baseUrl}/permessi`, data, {
            headers: guestReqHeader
        });
    }

    deletePermesso(data: TPermesso): Promise<AxiosResponse<GenericResponse>> {
        const params = queryToString(data);
        
        return axios.delete(`${baseUrl}/permessi?${params}`, {
            headers: adminReqHeader
        });
    }
    
}

export default new UserDataService();
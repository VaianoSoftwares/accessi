import axios from "axios";
import { GenericResponse } from "../types/Responses";
import { TAlert } from "../types/TAlert";

export function axiosErrHandl (err: any, openAlert: (alert: TAlert) => void, msg = "") {
    console.error(msg, err);
    if(axios.isAxiosError(err) && err.response) {
        const { success, msg }: TAlert = err.response.data as GenericResponse;
        openAlert({ success, msg });
    }
};
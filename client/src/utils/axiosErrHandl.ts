import axios from "axios";
import { Nullable } from "../types/Nullable";
import { GenericResponse } from "../types/Responses";
import { TAlert } from "../types/TAlert";

export function axiosErrHandl (err: unknown, setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>, msg = "") {
    console.error(msg, err);
    if(axios.isAxiosError(err) && err.response) {
        const { success, msg }: TAlert = err.response.data as GenericResponse;
        setAlert({ success, msg });
    }
};
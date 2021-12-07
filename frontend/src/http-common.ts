import axios from "axios";
import globals from "./global-vars";

export default axios.create({
    baseURL: globals.API_URL,
    headers: {
        "Content-type": "application/json"
    }
});
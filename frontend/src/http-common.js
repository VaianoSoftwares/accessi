import axios from "axios";

export default axios.create({
    baseURL: window.env.API_URL,
    headers: {
        "Content-type": "application/json"
    }
});
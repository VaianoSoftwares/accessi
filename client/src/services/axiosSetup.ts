import axios from "axios";

if(import.meta.env.DEV)
    axios.defaults.baseURL = import.meta.env.VITE_PROXY;

export default axios;
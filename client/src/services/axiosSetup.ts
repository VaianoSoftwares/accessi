import axios from "axios";

axios.defaults.withCredentials = true;

if(process.env.NODE_ENV !== "production")
    axios.defaults.baseURL = process.env.REACT_APP_PROXY;

export default axios;
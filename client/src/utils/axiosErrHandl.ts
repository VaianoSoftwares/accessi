import axios from "axios";
import toast from "react-hot-toast";

export function axiosErrHandl(err: any, msg = "") {
  if (msg) console.error(msg, "|", err);
  else console.error(err);
  axios.isAxiosError(err) && err.response && toast.error(err.response.data.msg);
}

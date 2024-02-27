import axios from "axios";
import toast from "react-hot-toast";

const unknownErrMsg = "unknown error";

export function axiosErrHandl(err: any, msg?: string) {
  if (msg) console.error(msg, "|", err);
  else console.error(err);

  if (axios.isAxiosError(err) && err.response?.data?.error?.message)
    toast.error(err.response.data.error.message || unknownErrMsg);
  else if (err instanceof Error) toast.error(err.message || unknownErrMsg);
  else toast.error(err ? String(err) : unknownErrMsg);
}

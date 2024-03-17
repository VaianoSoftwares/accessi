import { useContext } from "react";
import toast from "react-hot-toast";
import { CurrentUserContext } from "../components/RootProvider";

export function axiosErrHandl(err: any, msg?: string) {
  const { removeCurrentUser } = useContext(CurrentUserContext)!;

  if (msg) console.error(msg, "|", err);
  else console.error(err);

  const errMsg =
    err?.response?.data?.error?.message || err?.message || "unknown error";
  toast.error(errMsg);

  if (errMsg == "Sessione scaduta") removeCurrentUser();
}

import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CurrentUserContext } from "../components/RootProvider";

type ErrorWithInfo = {
  error: any;
  info?: string;
};

export default function useError() {
  const { removeCurrentUser } = useContext(CurrentUserContext)!;
  const [error, setError] = useState<ErrorWithInfo | null>(null);

  useEffect(() => {
    function errorHandler(err: any, info?: string) {
      console.error(info ? `${info} | ${err}` : err);

      const errMsg =
        err?.response?.data?.error?.message || err?.message || "unknown error";
      toast.error(errMsg);

      if (errMsg == "Sessione scaduta") removeCurrentUser();
    }

    if (error !== null) errorHandler(error.error, error.info);
  }, [error]);

  function handleError(err: any, info?: string) {
    if (!err) return;
    setError({ error: err, info });
  }

  return { handleError };
}

import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CurrentUserContext } from "../components/RootProvider";
import UserDataService from "../services/user";

type ErrorWithInfo = {
  error: any;
  info?: string;
};

export default function useError() {
  const { removeCurrentUser } = useContext(CurrentUserContext)!;
  const [error, setError] = useState<ErrorWithInfo | null>(null);

  useEffect(() => {
    async function errorHandler(err: any, info?: string) {
      console.error(info ? `${info} | ${err}` : err);

      const errMsg =
        err?.response?.data?.error?.message || err?.message || "unknown error";
      toast.error(errMsg);

      if (errMsg == "Sessione scaduta") {
        removeCurrentUser();
        await UserDataService.logout();
      }
    }

    if (error !== null)
      errorHandler(error.error, error.info).catch((e) => console.error(e));
  }, [error]);

  function handleError(err: any, info?: string) {
    if (!err) return;
    setError({ error: err, info });
  }

  return { handleError } as const;
}

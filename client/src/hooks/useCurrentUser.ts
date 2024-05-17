import { useEffect } from "react";
import { TUser } from "../types/users";
import useSessionStorage from "./useSessionStorage";
import { useNavigate } from "react-router-dom";

const storageKey = "user";

export default function useCurrentUser() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useSessionStorage<TUser | null>(
    storageKey,
    null
  );

  useEffect(() => {
    if (currentUser === null) {
      sessionStorage.removeItem(storageKey);
      navigate("/login");
    }
  }, [currentUser, storageKey]);

  function removeCurrentUser() {
    setCurrentUser(null);
  }

  return { currentUser, setCurrentUser, removeCurrentUser } as const;
}

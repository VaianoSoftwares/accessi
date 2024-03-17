import { useEffect } from "react";
import { TLoggedUser } from "../types/users";
import useSessionStorage from "./useSessionStorage";
import { useNavigate } from "react-router-dom";

const storageKey = "user";

export default function useCurrentUser() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useSessionStorage<TLoggedUser | null>(
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

  return { currentUser, setCurrentUser, removeCurrentUser };
}

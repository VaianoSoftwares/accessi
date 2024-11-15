import { useEffect, useState } from "react";
import { Postazione } from "../types/postazioni";

const userSessionStorageKey = "user";

export default function usePostazione() {
  const [currCliente, setCurrCliente] = useState<string>();
  const [currPostazione, setCurrPostazione] = useState<Postazione>();

  useEffect(() => {
    if (currPostazione?.cliente !== currCliente) {
      clearCurrPostazione();
    }

    if (currCliente === undefined) {
      let storedCliente = "";
      try {
        storedCliente = JSON.parse(
          sessionStorage.getItem(userSessionStorageKey) || ""
        )["clienti"][0];
      } catch {
        return;
      }

      setCurrCliente(storedCliente || undefined);
    }
  }, [currCliente, currPostazione]);

  function clearCurrCliente() {
    setCurrCliente(undefined);
  }

  function clearCurrPostazione() {
    setCurrPostazione(undefined);
  }

  return {
    currCliente,
    setCurrCliente,
    clearCurrCliente,
    currPostazione,
    setCurrPostazione,
    clearCurrPostazione,
  } as const;
}

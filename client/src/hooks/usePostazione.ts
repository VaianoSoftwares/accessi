import { useEffect, useState } from "react";
import { Postazione } from "../types/postazioni";

export default function usePostazione() {
  const [currCliente, setCurrCliente] = useState<string>();
  const [currPostazione, setCurrPostazione] = useState<Postazione>();

  useEffect(() => {
    if (currPostazione?.cliente !== currCliente) {
      clearCurrPostazione();
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

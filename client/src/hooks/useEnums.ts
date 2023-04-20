import React from "react";
import BadgeDataService from "../services/badge";
import { TEnums, TAssegnazione, TPostazione } from "../types";

type TUseEnums = [
  TEnums,
  {
    addAssegnazione: (assegnazione: TAssegnazione) => void;
    removeAssegnazione: (name: string) => void;
    addPostazione: (postazione: TPostazione) => void;
    removePostazione: (name: string) => void;
  }
];

const enumsInitState: TEnums = {
  assegnazione: [],
  cliente: [],
  postazione: [],
};

export default function useEnums(): TUseEnums {
  const [enums, setEnums] = React.useState(enumsInitState);

  React.useEffect(() => {
    const abortController = new AbortController();

    function retriveEnums() {
      BadgeDataService.getEnums(abortController.signal)
        .then((response) => {
          const enumsResp = response.data.data as TEnums;
          console.log("retriveEnums |", enumsResp);
          setEnums(enumsResp);
        })
        .catch((err) => {
          console.error("retriveEnums |", err);
        });
    }

    retriveEnums();

    return () => abortController.abort();
  }, []);

  function addAssegnazione(assegnazione: TAssegnazione) {
    setEnums((prev) => {
      prev!.assegnazione.push(assegnazione);
      return prev;
    });
    console.log(enums.assegnazione);
  }

  function removeAssegnazione(name: string) {
    setEnums((prev) => {
      prev!.assegnazione = prev!.assegnazione.filter((a) => a.name !== name);
      return prev;
    });
    console.log(enums.assegnazione);
  }

  function addPostazione(postazione: TPostazione) {
    setEnums((prev) => {
      prev!.postazione.push(postazione);
      return prev;
    });
  }

  function removePostazione(name: string) {
    setEnums((prev) => {
      prev!.postazione = prev!.postazione.filter((a) => a.name !== name);
      return prev;
    });
  }

  return [
    enums,
    {
      addAssegnazione,
      removeAssegnazione,
      addPostazione,
      removePostazione,
    },
  ];
}

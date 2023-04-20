import isObjKey from "../utils/isObjKey.js";

export type TDocumento = {
  codice: string;
  nome: string;
  cognome: string;
  azieda: string;
  filename: string;
};

export type TDocumentoReq = {
  [key: string]: string | undefined;
} & Partial<TDocumento>;

export type TDocUpdReq = TDocumentoReq & Pick<TDocumento, "codice">;

export function isDocUpdKey(key: string) {
  const obj: Omit<TDocumento, "codice"> = {
    nome: "",
    cognome: "",
    azieda: "",
    filename: "",
  };
  return isObjKey(key, obj);
}

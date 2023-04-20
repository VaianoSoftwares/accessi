import { TPostazione } from "../types";

export default function getClienteFromPostazione(
  postazione: string,
  postazioni: TPostazione[]
) {
  return postazioni.filter(({ name }) => postazione === name)?.[0].cliente;
}

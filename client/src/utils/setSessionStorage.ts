import { TUser } from "../types/TUser";

export default function setSessionStorage(user: TUser) {
    sessionStorage.setItem("username", user.name);
    sessionStorage.setItem("admin", user.admin.toString());
    sessionStorage.setItem("cliente", user.cliente);
    sessionStorage.setItem("postazione", user.postazione);
}
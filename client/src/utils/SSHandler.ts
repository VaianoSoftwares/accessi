import { TUser } from "../types/TUser";

export default class SSHandler {
  static getUserFromStorage(): TUser | null {
    const _id = sessionStorage.getItem("uid");
    const username = sessionStorage.getItem("username");
    const strAdmin = sessionStorage.getItem("admin");
    const token = sessionStorage.getItem("token");

    if (!_id || !username || !strAdmin || !token) return null;

    const admin = strAdmin === "true";

    if (admin)
      return {
        _id,
        username,
        admin,
        clienti: null,
        postazioni: null,
        token,
      };

    const clienti: string[] = [];
    for (let i = 0; ; ) {
      const cliente = sessionStorage.getItem(`cliente${i++}`);
      if (!cliente) break;
      clienti.push(cliente);
    }

    if (clienti.length === 0) return null;

    const postazioni: string[] = [];
    for (let i = 0; ; ) {
      const postazione = sessionStorage.getItem(`postazione${i++}`);
      if (!postazione) break;
      postazioni.push(postazione);
    }

    if (postazioni.length === 0) return null;

    return {
      _id,
      username,
      admin,
      clienti,
      postazioni,
      token,
    };
  }

  static setSessionStorage(user: TUser) {
    sessionStorage.setItem("uid", user._id);
    sessionStorage.setItem("username", user.username);
    sessionStorage.setItem("admin", user.admin.toString());
    user?.clienti?.forEach?.((value, index) =>
      sessionStorage.setItem(`cliente${index}`, value)
    );
    user?.postazioni?.forEach?.((value, index) =>
      sessionStorage.setItem(`postazione${index}`, value)
    );
    sessionStorage.setItem("token", user.token);
  }

  static getPostazione() {
    return sessionStorage.getItem("postazione0")!;
  }

  static setPostazione(str: string) {
    sessionStorage.setItem("postazione0", str);
  }

  static getGuestInStruttReq() {
    return {
      cliente: sessionStorage.getItem("cliente0")!,
      postazione: sessionStorage.getItem("postazione0")!,
    };
  }
}

import { ObjectId } from "mongodb";

class SessionUser {
  id: string | ObjectId = "";
  username: string = "";
  admin: boolean = false;
  cliente: string = "";
  postazione: string = "";
  expiration: number = Date.now() + 1000 * 20;

  constructor(
    id: string,
    username: string,
    admin: boolean,
    cliente: string,
    postazione: string
  ) {
    this.id = id;
    this.username = username;
    this.admin = admin;
    this.cliente = cliente;
    this.postazione = postazione;
    this.updateExpiration();
  }

  updateExpiration() {
    this.expiration = Date.now() + 1000 * 20;
    return this;
  }

  hasExpired() {
    return Date.now() >= this.expiration;
  }
}

export default SessionUser;
import { ObjectId } from "mongodb";

class SessionUser {
  id: string | ObjectId = "";
  username: string = "";
  admin: boolean = false;
  cliente: string = "";
  postazione: string = "";
  token: string = ""
}

export default SessionUser;
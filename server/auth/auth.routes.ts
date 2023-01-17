import express from "express";
import UsersCtrl from "./auth.controller.js";
import PermessiCtrl from "./auth.permessi.js";
import AuthToken from "./verifyToken.js";

const Router = express.Router();

Router.route("/register").post(AuthToken.verifyAdmin, UsersCtrl.apiRegister);
Router.route("/login").post(UsersCtrl.apiLogin);
Router.route("/logout").post(AuthToken.verifyGuest, UsersCtrl.apiLogout);
Router.route("/session").get(UsersCtrl.apiGetSession);

Router.route("/permessi")
    .get(AuthToken.verifyGuest, PermessiCtrl.apiGetPermessi)
    .post(AuthToken.verifyGuest, PermessiCtrl.apiPostPermessi)
    .delete(AuthToken.verifyAdmin, PermessiCtrl.apiDeletePermessi);

export default Router;
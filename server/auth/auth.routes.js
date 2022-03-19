import express from "express";
import UsersCtrl from "./auth.controller.js";
import AuthToken from "./verifyToken.js";

const Router = express.Router();

Router.route("/register").post(AuthToken.verifyGuest, AuthToken.verifyAdmin, UsersCtrl.apiRegister);
Router.route("/login").post(UsersCtrl.apiLogin);

export default Router;
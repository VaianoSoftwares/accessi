import express from "express";
import UsersCtrl from "./auth.controller.js";

const Router = express.Router();

Router.route("/register").post(UsersCtrl.apiRegister);
Router.route("/login").post(UsersCtrl.apiLogin);

export default Router;
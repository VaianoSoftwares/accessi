import express from "express";
import JwtAuth from "../middlewares/JwtAuth.js";
import UsersCtrl from "./auth.controller.js";
import PermessiCtrl from "./auth.permessi.js";

const Router = express.Router();

Router.route("/register").post(
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  UsersCtrl.apiRegister
);
Router.route("/login").post(UsersCtrl.apiLogin);

Router.route("/").get(
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  UsersCtrl.apiGetAllUsers
);

Router.route("/user/:userId")
  .get(JwtAuth.verifyToken, JwtAuth.isAdmin, UsersCtrl.apiGetUserById)
  .put(JwtAuth.verifyToken, JwtAuth.isAdmin, UsersCtrl.apiUpdateUser)
  .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, UsersCtrl.apiDeleteUser);

Router.route("/user/device").post(UsersCtrl.apiGetUserWithDevice);

Router.route("/permessi")
  .get(JwtAuth.verifyToken, PermessiCtrl.apiGetPermessi)
  .post(JwtAuth.verifyToken, PermessiCtrl.apiPostPermessi)
  .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, PermessiCtrl.apiDeletePermessi);

export default Router;

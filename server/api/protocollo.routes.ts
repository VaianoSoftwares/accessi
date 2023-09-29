import express from "express";
import JwtAuth from "../middlewares/JwtAuth.js";
import ProtocolloCtrl from "./protocollo.controller.js";

const Router = express.Router();

Router.route("/")
  .get(JwtAuth.verifyToken, ProtocolloCtrl.apiGetProtocollo)
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, ProtocolloCtrl.apiPostProtocollo)
  .delete(
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    ProtocolloCtrl.apiDeleteProtocollo
  );

export default Router;

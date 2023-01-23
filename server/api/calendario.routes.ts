import express from "express";
import JwtAuth from "../middlewares/JwtAuth.js";
import CalendarioCtrl from "./calendario.controller.js";

const Router = express.Router();

Router
    .route("/")
    .get(JwtAuth.verifyToken, CalendarioCtrl.apiGetCalendario)
    .post(JwtAuth.verifyToken, JwtAuth.isAdmin, CalendarioCtrl.apiPostCalendario)                       
    .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, CalendarioCtrl.apiDeleteCalendario);

export default Router;
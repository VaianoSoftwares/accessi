import express from "express";
import AuthToken from "../auth/verifyToken.js";
import CalendarioCtrl from "./calendario.controller.js";

const Router = express.Router();

Router
    .route("/")
    .get(AuthToken.verifyGuest, CalendarioCtrl.apiGetCalendario)
    .post(AuthToken.verifyAdmin, CalendarioCtrl.apiPostCalendario)                       
    .delete(AuthToken.verifyAdmin, CalendarioCtrl.apiDeleteCalendario);

export default Router;
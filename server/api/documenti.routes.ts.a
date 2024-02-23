import express from "express";
import DocCtrl from "./documenti.controller.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const Router = express.Router();

Router
    .route("/")
    .get(JwtAuth.verifyToken, DocCtrl.apiGetDocumenti)                        // ricerca documento
    .post(JwtAuth.verifyToken, JwtAuth.isAdmin, DocCtrl.apiPostDocumenti)                      // aggiungi nuovo documento
    .put(JwtAuth.verifyToken, JwtAuth.isAdmin, DocCtrl.apiPutDocumenti)                        // modifica un documento
    .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, DocCtrl.apiDeleteDocumenti);                 // elimina un documento

export default Router;
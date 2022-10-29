import express from "express";
import DocCtrl from "./documenti.controller.js";
import AuthToken from "../auth/verifyToken.js";

const Router = express.Router();

Router
    .route("/")
    .get(AuthToken.verifyGuest, DocCtrl.apiGetDocumenti)                        // ricerca documento
    .post(AuthToken.verifyAdmin, DocCtrl.apiPostDocumenti)                      // aggiungi nuovo documento
    .put(AuthToken.verifyAdmin, DocCtrl.apiPutDocumenti)                        // modifica un documento
    .delete(AuthToken.verifyAdmin, DocCtrl.apiDeleteDocumenti);                 // elimina un documento

export default Router;
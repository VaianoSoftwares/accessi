import express from "express";
import BadgesCtrl from "./badges.controller.js";
import ArchivioCtrl from "./archivio.controller.js";
import PrestitiCtrl from "./prestiti.controller.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const Router = express.Router();

Router
    .route("/")
    .get(JwtAuth.verifyToken, BadgesCtrl.apiGetBadges)                        // ricerca badge
    .post(JwtAuth.verifyToken, BadgesCtrl.apiPostBadges)                      // aggiungi nuovo badge
    .put(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiPutBadges)                        // modifica un badge
    .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeleteBadges);                 // elimina un badge

Router
    .route("/enums")
    .get(BadgesCtrl.apiGetEnums);                                               // ottieni enums

Router
    .route("/assegnazioni")
    .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiPostAssegnazioni)                // aggiungi nuova assegnazione
    .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeleteAssegnazioni);           // elimina una assegnazione

// Router
//     .route("/postazioni")
//     .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiPostPostazione)
//     .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeletePostazione);

Router
    .route("/archivio")
    .get(JwtAuth.verifyToken, JwtAuth.isAdmin, ArchivioCtrl.apiGetArchivio)                    // ottieni archivio
    .post(JwtAuth.verifyToken, ArchivioCtrl.apiPostArchivio);                 // timbra entrata/uscita

Router
    .route("/archivio/in-struttura")
    .get(JwtAuth.verifyToken, ArchivioCtrl.apiGetInStruttura);                // ottieni lista persone in struttura

Router
    .route("/archivio-chiavi")
    .get(JwtAuth.verifyToken, JwtAuth.isAdmin, PrestitiCtrl.apiGetArchivioChiave)              // ottieni archivio chiavi
    .post(JwtAuth.verifyToken, PrestitiCtrl.apiPostArchivioChiave);           // prestito chiave

Router
    .route("/archivio-chiavi/in-prestito")
    .get(JwtAuth.verifyToken, PrestitiCtrl.apiGetInPrestito);                 // ottieni lista chiavi in prestito

export default Router;
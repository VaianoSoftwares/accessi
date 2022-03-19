import express from "express";
import BadgesCtrl from "./badges.controller.js";
import ArchivioCtrl from "./archivio.controller.js";
import AuthToken from "../auth/verifyToken.js";

const Router = express.Router();

Router
    .route("/")
    .get(BadgesCtrl.apiGetBadges)                                               // ricerca badge
    .post(AuthToken.verifyAdmin, BadgesCtrl.apiPostBadges)                      // aggiungi nuovo badge
    .put(AuthToken.verifyAdmin, BadgesCtrl.apiPutBadges)                        // modifica un badge
    .delete(AuthToken.verifyAdmin, BadgesCtrl.apiDeleteBadges);                 // elimina un badge

Router
    .route("/assegnazioni")
    .get(BadgesCtrl.apiGetAssegnazioni)                                         // ottieni assegnazioni
    .post(AuthToken.verifyAdmin, BadgesCtrl.apiPostAssegnazioni)                // aggiungi nuova assegnazione
    .delete(AuthToken.verifyAdmin, BadgesCtrl.apiDeleteAssegnazioni);           // elimina una assegnazione

Router.route("/tipi-doc").get(BadgesCtrl.apiGetTipiDoc);                        // ottieni tipi documento
Router.route("/stati").get(BadgesCtrl.apiGetStati);                             // ottieni tipi stato badge
Router.route("/tipi").get(BadgesCtrl.apiGetTipiBadge);                          // ottieni tipi badge

Router
    .route("/archivio")
    .get(ArchivioCtrl.apiGetArchivio)                                           // ottieni archivio
    .post(ArchivioCtrl.apiPostArchivio);                                        // timbra entrata/uscita

Router.route("/archivio/in-struttura").get(ArchivioCtrl.apiGetInStruttura);     // ottieni lista persone in struttura

export default Router;
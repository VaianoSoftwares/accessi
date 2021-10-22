import express from "express";
import BadgesCtrl from "./badges.controller.js";
import ArchivioCtrl from "./archivio.controller.js";

const Router = express.Router();

Router
    .route("/")
    .get(BadgesCtrl.apiGetBadges)                                               // ricerca badge
    .post(BadgesCtrl.apiPostBadges)                                             // aggiungi nuovo badge
    .put(BadgesCtrl.apiPutBadges)                                               // modifica un badge
    .delete(BadgesCtrl.apiDeleteBadges);                                        // elimina un badge

Router
    .route("/assegnazioni")
    .get(BadgesCtrl.apiGetAssegnazioni)                                         // ottieni assegnazioni
    .post(BadgesCtrl.apiPostAssegnazioni)                                       // aggiungi nuova assegnazione
    .delete(BadgesCtrl.apiDeleteAssegnazioni);                                  // elimina una assegnazione

Router.route("/tipi-doc").get(BadgesCtrl.apiGetTipiDoc);                        // ottieni tipi documento
Router.route("/stati").get(BadgesCtrl.apiGetStati);                             // ottieni tipi stato badge
Router.route("/tipi").get(BadgesCtrl.apiGetTipiBadge);                          // ottieni tipi badge

Router
    .route("/archivio")
    .get(ArchivioCtrl.apiGetArchivio)                                           // ottieni archivio
    .post(ArchivioCtrl.apiPostArchivio);                                        // timbra entrata/uscita

Router.route("/archivio/in-struttura").get(ArchivioCtrl.apiGetInStruttura);     // ottieni lista persone in struttura

export default Router;
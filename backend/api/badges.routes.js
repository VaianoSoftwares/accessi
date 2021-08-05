import express from "express";
import BadgesCtrl from "./badges.controller.js";
import ArchivioCtrl from "./archivio.controller.js";

const Router = express.Router();

Router
    .route("/")
    .get(BadgesCtrl.apiGetBadges)                                               //ricerca badge
    .post(BadgesCtrl.apiPostBadges)                                             //aggiungi nuovo badge
    .put(BadgesCtrl.apiPutBadges)                                               //modifica un badge
    .delete(BadgesCtrl.apiDeleteBadges);                                        //elimina un badge

Router.route("/tipo/:tipo").get(BadgesCtrl.apiGetBadges);                       //ricerca badge tipo specifico

Router.route("/reparti").get(BadgesCtrl.apiGetReparti);                         //ottieni reparti
Router.route("/tipi-doc").get(BadgesCtrl.apiGetTipiDoc);                        //ottieni tipi documento

Router
    .route("/archivio")
    .get(ArchivioCtrl.apiGetArchivio)                                           //ottieni archivio
    .post(ArchivioCtrl.apiPostArchivio);                                        //timbra entrata/uscita
//  .put("/archivio", ArchivioCtrl.apiPutArchivio)                              //timbra uscita

Router.route("/archivio/in-struttura").get(ArchivioCtrl.apiGetInStruttura);     //ottieni lista persone in struttura

export default Router;
import express from "express";
import BadgesCtrl from "./badges.controller.js";
import ArchivioCtrl from "./archivio.controller.js";
import AuthToken from "../auth/verifyToken.js";
import PrestitiCtrl from "./prestiti.controller.js";

const Router = express.Router();

Router
    .route("/")
    .get(AuthToken.verifyGuest, BadgesCtrl.apiGetBadges)                        // ricerca badge
    .post(AuthToken.verifyAdmin, BadgesCtrl.apiPostBadges)                      // aggiungi nuovo badge
    .put(AuthToken.verifyAdmin, BadgesCtrl.apiPutBadges)                        // modifica un badge
    .delete(AuthToken.verifyAdmin, BadgesCtrl.apiDeleteBadges);                 // elimina un badge

Router
    .route("/enums")
    .get(BadgesCtrl.apiGetEnums);                                               // ottieni enums

Router
    .route("/assegnazioni")
    // .get(AuthToken.verifyGuest, BadgesCtrl.apiGetAssegnazioni)                  // ottieni assegnazioni
    .post(AuthToken.verifyAdmin, BadgesCtrl.apiPostAssegnazioni)                // aggiungi nuova assegnazione
    .delete(AuthToken.verifyAdmin, BadgesCtrl.apiDeleteAssegnazioni);           // elimina una assegnazione

// Router.route("/tipi-doc").get(BadgesCtrl.apiGetTipiDoc);                        // ottieni tipi documento
// Router.route("/stati").get(BadgesCtrl.apiGetStati);                             // ottieni tipi stato badge
// Router.route("/tipi").get(BadgesCtrl.apiGetTipiBadge);                          // ottieni tipi badge

Router
    .route("/archivio")
    .get(AuthToken.verifyAdmin, ArchivioCtrl.apiGetArchivio)                    // ottieni archivio
    .post(AuthToken.verifyGuest, ArchivioCtrl.apiPostArchivio);                 // timbra entrata/uscita

Router
    .route("/archivio/in-struttura")
    .get(AuthToken.verifyGuest, ArchivioCtrl.apiGetInStruttura);                // ottieni lista persone in struttura

Router
    .route("/archivio-chiavi")
    .get(AuthToken.verifyAdmin, PrestitiCtrl.apiGetArchivioChiave)              // ottieni archivio chiavi
    .post(AuthToken.verifyGuest, PrestitiCtrl.apiPostArchivioChiave);           // prestito chiave

Router
    .route("/archivio-chiavi/in-prestito")
    .get(AuthToken.verifyGuest, PrestitiCtrl.apiGetInPrestito);                 // ottieni lista chiavi in prestito

export default Router;
import express from "express";
import BadgesCtrl from "./badges.controller.js";
import ArchivioCtrl from "./archivio.controller.js";
import PrestitiCtrl from "./prestiti.controller.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const Router = express.Router();

Router.route("/")
  .get(JwtAuth.verifyToken, BadgesCtrl.apiGetBadges)
  .post(JwtAuth.verifyToken, BadgesCtrl.apiPostBadges)
  .put(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiPutBadges)
  .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeleteBadges);

Router.route("/assegnazioni")
  .get(BadgesCtrl.apiGetAssegnazioni)
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiPostAssegnazioni)
  .delete(
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeleteAssegnazioni
  );

Router.route("/postazioni")
  .get(BadgesCtrl.apiGetPostazioni)
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiPostPostazione);
Router.route("/postazioni/:idPostazione").delete(
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  BadgesCtrl.apiDeletePostazione
);

Router.route("/clienti")
  .get(BadgesCtrl.apiGetClienti)
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiPostCliente);
Router.route("/clienti/:cliente").delete(
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  BadgesCtrl.apiDeleteCliente
);

Router.route("/archivio")
  .get(JwtAuth.verifyToken, JwtAuth.isAdmin, ArchivioCtrl.apiGetArchivio)
  .post(JwtAuth.verifyToken, ArchivioCtrl.apiPostArchivio);

Router.route("/archivio/in-struttura").get(
  JwtAuth.verifyToken,
  ArchivioCtrl.apiGetInStruttura
);

Router.route("/archivio-chiavi")
  .get(JwtAuth.verifyToken, JwtAuth.isAdmin, PrestitiCtrl.apiGetArchivioChiave)
  .post(JwtAuth.verifyToken, PrestitiCtrl.apiPostArchivioChiave);

Router.route("/archivio-chiavi/in-prestito").get(
  JwtAuth.verifyToken,
  PrestitiCtrl.apiGetInPrestito
);

export default Router;

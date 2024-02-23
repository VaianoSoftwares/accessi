import Router from "express-promise-router";
import * as BadgesCtrl from "../controllers/badges.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, BadgesCtrl.apiGetBadges);
router
  .route("/nominativi")
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiInsertNominativo)
  .put(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiUpdateNominativo)
  .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeleteNominativo);
router
  .route("/provvisori")
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiInsertProvvisorio)
  .put(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiUpdateProvvisorio)
  .delete(
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeleteProvvisorio
  );
router
  .route("/chiavi")
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiInsertChiave)
  .put(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiUpdateChiave)
  .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeleteChiave);
router
  .route("/veicoli")
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiInsertVeicolo)
  .put(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiUpdateVeicolo)
  .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeleteVeicolo);
router
  .route("/persone")
  .get(JwtAuth.verifyToken, BadgesCtrl.apiGetPersone)
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiInsertPersona)
  .put(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiUpdatePersona)
  .delete(JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiDeletePersona);
router.get("/assegnazioni", BadgesCtrl.apiGetAssegnazioni);
router.get("/edifici", BadgesCtrl.apiGetEdifici);
router.get("/tveicoli", BadgesCtrl.apiGetTVeicoli);

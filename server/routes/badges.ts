import Router from "express-promise-router";
import * as BadgesCtrl from "../controllers/badges.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, BadgesCtrl.apiGetBadges);

router
  .post(
    "/nominativo",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiInsertNominativo
  )
  .put(
    "/nominativo/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiUpdateNominativo
  )
  .delete(
    "/nominativo/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeleteNominativo
  );

router
  .post(
    "/provvisorio",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiInsertProvvisorio
  )
  .put(
    "/provvisorio/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiUpdateProvvisorio
  )
  .delete(
    "/provvisorio/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeleteProvvisorio
  );

router
  .post(
    "/chiave",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiInsertChiave
  )
  .put(
    "/chiave/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiUpdateChiave
  )
  .delete(
    "/chiave/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeleteChiave
  );

router
  .post(
    "/veicolo",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiInsertVeicolo
  )
  .put(
    "/veicolo/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiUpdateVeicolo
  )
  .delete(
    "/veicolo/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeleteVeicolo
  );

router
  .get("/persona", JwtAuth.verifyToken, BadgesCtrl.apiGetPersone)
  .post(
    "/persona",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiInsertPersona
  )
  .put(
    "/persona/:ndoc/:tdoc",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiUpdatePersona
  )
  .delete(
    "/persona/:ndoc/:tdoc",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeletePersona
  );

router.get("/assegnazioni", BadgesCtrl.apiGetAssegnazioni);
router.get("/edifici", BadgesCtrl.apiGetEdifici);
router.get("/tveicoli", BadgesCtrl.apiGetTVeicoli);

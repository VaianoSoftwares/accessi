import Router from "express-promise-router";
import NominativiController from "../controllers/nominativi.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .get("/", JwtAuth.verifyToken, NominativiController.apiGetNominativi)
  .post(
    "/",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    NominativiController.apiInsertNominativo
  )
  .put(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    NominativiController.apiUpdateNominativo
  )
  .delete(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    NominativiController.apiDeleteNominativo
  );

router.get("/assegnazioni", NominativiController.apiGetAssegnazioni);

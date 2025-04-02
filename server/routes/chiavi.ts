import Router from "express-promise-router";
import ChiaviController from "../controllers/chiavi.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, ChiaviController.apiGetChiavi);
router.post(
  "/",
  JwtAuth.verifyToken,
  JwtAuth.canEditBadges,
  ChiaviController.apiInsertChiave
);
router.put(
  "/:codice",
  JwtAuth.verifyToken,
  JwtAuth.canEditBadges,
  ChiaviController.apiUpdateChiave
);
router.delete(
  "/:codice",
  JwtAuth.verifyToken,
  JwtAuth.canEditBadges,
  ChiaviController.apiDeleteChiave
);

router.get("/edifici", ChiaviController.apiGetEdifici);

router.get(
  "/w_mazzo_descr",
  JwtAuth.verifyToken,
  ChiaviController.apiGetChiaviWMazzoDescr
);

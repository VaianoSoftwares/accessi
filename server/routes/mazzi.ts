import Router from "express-promise-router";
import MazziChiaviController from "../controllers/mazzi.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, MazziChiaviController.apiGetMazzi);
router.post(
  "/",
  JwtAuth.verifyToken,
  JwtAuth.canEditBadges,
  MazziChiaviController.apiInsertMazzo
);
router.put(
  "/:codice",
  JwtAuth.verifyToken,
  JwtAuth.canEditBadges,
  MazziChiaviController.apiUpdateMazzo
);
router.delete(
  "/:codice",
  JwtAuth.verifyToken,
  JwtAuth.canEditBadges,
  MazziChiaviController.apiDeleteMazzo
);

router.get(
  "/free-keys",
  JwtAuth.verifyToken,
  MazziChiaviController.apiGetChiaviNotInMazzo
);

router.get(
  "/with-counter",
  JwtAuth.verifyToken,
  MazziChiaviController.apiGetMazziWithKeyCounter
);

import Router from "express-promise-router";
import * as BadgesCtrl from "../controllers/badges.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .get("/", JwtAuth.verifyToken, BadgesCtrl.apiGetBadges)
  .post("/", JwtAuth.verifyToken, JwtAuth.isAdmin, BadgesCtrl.apiInsertBadge)
  .put(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiUpdateBadge
  )
  .delete(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    BadgesCtrl.apiDeleteBadge
  );

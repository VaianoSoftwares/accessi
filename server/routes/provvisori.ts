import Router from "express-promise-router";
import ProvvisoriController from "../controllers/provvisori.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .get("/", JwtAuth.verifyToken, ProvvisoriController.apiGetProvvisori)
  .post(
    "/",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    ProvvisoriController.apiInsertProvvisorio
  )
  .put(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    ProvvisoriController.apiUpdateProvvisorio
  )
  .delete(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    ProvvisoriController.apiDeleteProvvisorio
  );

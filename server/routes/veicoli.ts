import Router from "express-promise-router";
import VeicoliController from "../controllers/veicoli.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .get("/", JwtAuth.verifyToken, VeicoliController.apiGetVeicoli)
  .post(
    "/",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    VeicoliController.apiInsertVeicolo
  )
  .put(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    VeicoliController.apiUpdateVeicolo
  )
  .delete(
    "/:codice",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    VeicoliController.apiDeleteVeicolo
  );

router.get("/tveicoli", VeicoliController.apiGetTVeicoli);

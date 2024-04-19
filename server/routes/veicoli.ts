import Router from "express-promise-router";
import * as VeicoliCtrl from "../controllers/veicoli.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .get("/", JwtAuth.verifyToken, VeicoliCtrl.apiGetVeicoli)
  .post("/", JwtAuth.verifyToken, JwtAuth.isAdmin, VeicoliCtrl.apiInsertVeicolo)
  .put(
    "/:id",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    VeicoliCtrl.apiUpdateVeicolo
  )
  .delete(
    "/:id",
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    VeicoliCtrl.apiDeleteVeicolo
  );

router.get("/tveicoli", VeicoliCtrl.apiGetTVeicoli);

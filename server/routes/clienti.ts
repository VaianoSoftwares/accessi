import Router from "express-promise-router";
import * as ClientiCtrl from "../controllers/clienti.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .route("/")
  .get(JwtAuth.verifyToken, ClientiCtrl.apiGetClienti)
  .post(JwtAuth.verifyToken, JwtAuth.isAdmin, ClientiCtrl.apiInsertCliente);
router.delete(
  "/:cliente",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  ClientiCtrl.apiDeleteCliente
);

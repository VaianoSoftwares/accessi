import Router from "express-promise-router";
import * as ProtCtrl from "../controllers/protocolli.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .route("/")
  .get(JwtAuth.verifyToken, ProtCtrl.apiGetProtocolli)
  .post(JwtAuth.verifyToken, ProtCtrl.apiInsertProtocollo);
router.delete("/:id", JwtAuth.verifyToken, ProtCtrl.apiDeleteProtocollo);

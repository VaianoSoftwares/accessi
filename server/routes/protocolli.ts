import Router from "express-promise-router";
import ProtocolliController from "../controllers/protocolli.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .route("/")
  .get(JwtAuth.verifyToken, ProtocolliController.apiGetProtocolli)
  .post(JwtAuth.verifyToken, ProtocolliController.apiInsertProtocollo);
router.delete(
  "/:id",
  JwtAuth.verifyToken,
  ProtocolliController.apiDeleteProtocollo
);

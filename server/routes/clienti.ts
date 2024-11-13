import Router from "express-promise-router";
import ClientiController from "../controllers/clienti.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .route("/")
  .get(ClientiController.apiGetClienti)
  .post(
    JwtAuth.verifyToken,
    JwtAuth.canEditClienti,
    ClientiController.apiInsertCliente
  );
router.delete(
  "/:cliente",
  JwtAuth.verifyToken,
  JwtAuth.canEditClienti,
  ClientiController.apiDeleteCliente
);

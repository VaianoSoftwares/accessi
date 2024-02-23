import Router from "express-promise-router";
import * as PostazioniCtrl from "../controllers/postazioni.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .route("/")
  .get(JwtAuth.verifyToken, PostazioniCtrl.apiGetPostazioni)
  .post(
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    PostazioniCtrl.apiInsertPostazione
  );
router.delete(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  PostazioniCtrl.apiDeletePostazione
);

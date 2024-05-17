import Router from "express-promise-router";
import PostazioniController from "../controllers/postazioni.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .route("/")
  .get(PostazioniController.apiGetPostazioni)
  .post(
    JwtAuth.verifyToken,
    JwtAuth.isAdmin,
    PostazioniController.apiInsertPostazione
  );
router.delete(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  PostazioniController.apiDeletePostazione
);

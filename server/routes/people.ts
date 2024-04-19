import Router from "express-promise-router";
import * as PeoplesCtrl from "../controllers/people.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, PeoplesCtrl.apiGetPeoples);
router.post(
  "/",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  PeoplesCtrl.apiInsertPerson
);
router.put(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  PeoplesCtrl.apiUpdatePerson
);
router.delete(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  PeoplesCtrl.apiDeletePerson
);

router.get("/assegnazioni", PeoplesCtrl.apiGetAssegnazioni);

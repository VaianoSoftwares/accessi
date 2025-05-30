import Router from "express-promise-router";
import PeopleController from "../controllers/people.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router
  .get("/", JwtAuth.verifyToken, PeopleController.apiGetPeople)
  .post(
    "/",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    PeopleController.apiInsertPerson
  )
  .put(
    "/:id",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    PeopleController.apiUpdatePerson
  )
  .delete(
    "/:id",
    JwtAuth.verifyToken,
    JwtAuth.canEditBadges,
    PeopleController.apiDeletePerson
  );

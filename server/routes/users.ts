import Router from "express-promise-router";
import UsersController from "../controllers/users.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get(
  "/",
  JwtAuth.verifyToken,
  JwtAuth.canEditUsers,
  UsersController.apiGetAllUsers
);
router.get(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.canEditUsers,
  UsersController.apiGetUserById
);
router.put(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.canEditUsers,
  UsersController.apiUpdateUser
);
router.delete(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.canEditUsers,
  UsersController.apiDeleteUser
);
router.post(
  "/register",
  JwtAuth.verifyToken,
  JwtAuth.canEditUsers,
  UsersController.apiRegister
);
router.post("/login", UsersController.apiLogin);
router.post("/login/tmp", UsersController.apiTmpLogin);
router.post(
  "/login/refresh",
  JwtAuth.verifyToken,
  JwtAuth.isDevice,
  UsersController.apiRefreshLogin
);
router.post("/logout", JwtAuth.verifyToken, UsersController.apiLogout);
router.put(
  "/:id/postazioni",
  JwtAuth.verifyToken,
  JwtAuth.canEditUsers,
  UsersController.apiUpdatePostazioniUser
);

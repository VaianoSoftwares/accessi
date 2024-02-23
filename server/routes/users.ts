import Router from "express-promise-router";
import * as UsersCtrl from "../controllers/users.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, JwtAuth.isAdmin, UsersCtrl.apiGetAllUsers);
router.get(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  UsersCtrl.apiGetUserById
);
router.put(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  UsersCtrl.apiUpdateUser
);
router.delete(
  "/:id",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  UsersCtrl.apiDeleteUser
);
router.post(
  "/register",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  UsersCtrl.apiRegister
);
router.post("/login", UsersCtrl.apiLogin);
router.post("/login/tmp", UsersCtrl.apiTmpLogin);
router.post(
  "/login/refresh",
  JwtAuth.verifyToken,
  JwtAuth.isDevice,
  UsersCtrl.apiRefreshLogin
);
router.put(
  "/:id/postazioni",
  JwtAuth.verifyToken,
  JwtAuth.isAdmin,
  UsersCtrl.apiUpdatePostazioniUser
);

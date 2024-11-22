import { Router } from "express";
import SSEController from "../controllers/sse.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, SSEController.apiHandleEvents);

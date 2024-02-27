import Router from "express-promise-router";
import * as ArchivioCtrl from "../controllers/archivio.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, ArchivioCtrl.apiGetArchivio);
router.get("/in-struttura", JwtAuth.verifyToken, ArchivioCtrl.apiGetInStrutt);
router.get("/in-prestito", JwtAuth.verifyToken, ArchivioCtrl.apiGetInPrestito);
router.post("/timbra/badge", JwtAuth.verifyToken, ArchivioCtrl.apiTimbraBadge);
router.post(
  "/timbra/chiavi",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraChiavi
);
router.post(
  "/insert-provvisorio",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiInsertProvvisorio
);

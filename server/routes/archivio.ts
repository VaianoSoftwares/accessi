import Router from "express-promise-router";
import * as ArchivioCtrl from "../controllers/archivio.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, ArchivioCtrl.apiGetArchivio);

router.get(
  "/in-struttura/badges",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiGetBadgesInStrutt
);
router.get(
  "/in-struttura/veicoli",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiGetVeicoliInStrutt
);

router.get("/in-prestito", JwtAuth.verifyToken, ArchivioCtrl.apiGetInPrestito);

router.post("/timbra/badge", JwtAuth.verifyToken, ArchivioCtrl.apiTimbraBadge);
router.post(
  "/timbra/veicolo",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraVeicolo
);
router.post(
  "/timbra/chiavi",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraChiavi
);

router.post(
  "/insert-provvisorio/badge",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiInsertBadgeProvvisorio
);
router.post(
  "/insert-provvisorio/veicolo",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiInsertBadgeProvvisorio
);

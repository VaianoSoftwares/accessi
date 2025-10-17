import Router from "express-promise-router";
import ArchivioController from "../controllers/archivio.js";
import JwtAuth from "../middlewares/JwtAuth.js";

const router = Router();

export default router;

router.get("/", JwtAuth.verifyToken, ArchivioController.apiGetArchivio);
router.post("/", JwtAuth.verifyToken, ArchivioController.apiUpdateArchivio);

router.get(
  "/in-struttura/badges",
  JwtAuth.verifyToken,
  ArchivioController.apiGetBadgesInStrutt
);
router.get(
  "/in-struttura/veicoli",
  JwtAuth.verifyToken,
  JwtAuth.canUpdateArchivio,
  ArchivioController.apiGetVeicoliInStrutt
);

router.get(
  "/in-prestito",
  JwtAuth.verifyToken,
  ArchivioController.apiGetInPrestito
);

router.post(
  "/timbra/badge",
  JwtAuth.verifyToken,
  ArchivioController.apiTimbraBadge
);
router.post(
  "/timbra/veicolo",
  JwtAuth.verifyToken,
  ArchivioController.apiTimbraVeicolo
);
router.post(
  "/timbra/chiavi",
  JwtAuth.verifyToken,
  ArchivioController.apiTimbraChiavi
);

router.post(
  "/insert-provvisorio/badge",
  JwtAuth.verifyToken,
  ArchivioController.apiInsertBadgeProvvisorio
);
router.post(
  "/insert-provvisorio/veicolo",
  JwtAuth.verifyToken,
  ArchivioController.apiInsertBadgeProvvisorio
);

router.get(
  "/tracciato",
  JwtAuth.verifyToken,
  ArchivioController.apiGetTracciati
);

router.post(
  "/timbra/badges",
  JwtAuth.verifyToken,
  ArchivioController.apiTimbraBadgesFromUtility
);

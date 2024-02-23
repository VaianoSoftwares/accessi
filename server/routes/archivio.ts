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
  "/timbra-entrata-nominativo",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraEntrataNominativo
);
router.post(
  "/timbra-uscita-nominativo",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraUscitaNominativo
);
router.post(
  "/timbra-entrata-veicolo",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraEntrataVeicolo
);
router.post(
  "/timbra-uscita-veicolo",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraUscitaVeicolo
);
router.post(
  "/insert-provvisorio",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiInsertProvvisorio
);
router.post(
  "/timbra-entrata-provvisorio",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraEntrataProvvisorio
);
router.post(
  "/timbra-uscita-provvisorio",
  JwtAuth.verifyToken,
  ArchivioCtrl.apiTimbraUscitaProvvisorio
);

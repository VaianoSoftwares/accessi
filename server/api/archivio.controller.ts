import ArchivioDAO from "../dao/archivio.dao.js";
import Validator from "../auth/validation.js";
import { Request, Response } from "express";
import errCheck from "../middlewares/errCheck.js";
import Badge, { TGenericBadge, TGenericNom } from "../types/badges.js";

export default class ArchivioController {

  static async apiGetArchivio(req: Request, res: Response) {
    try {
      console.log("apiGetArchivio | req.query: ", req.query);
      const archivioResponse = await ArchivioDAO.getArchivio(req.query);
      console.log("apiGetArchivio | archivioResponse: ", archivioResponse);
      res.json({
        success: true,
        data: archivioResponse,
        filters: req.query,
        msg: "Archivio ottenuto con successo"
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetArchivio |");
      res.status(500).json({
        success: false,
        data: [],
        filters: req.query,
        msg: error,
      });
    }
  }

  static async apiPostArchivio(req: Request, res: Response) {
    // barcode, tipo, cliente, postazione are REQUIRED in order to execute a "timbratura"
    const valErr = Validator.timbra(req.body).error;
    if (valErr) {
      return res
        .status(400)
        .json({ success: false, msg: valErr.details[0].message, data: null });
    }
    
    const { cliente, postazione } = req.body;
    // get address of client machine requesting for "timbra"
    const { ip } = req;

    // badge provvisorio data gathered from "timbra provvisori" input boxes for nominativo object
    const nominativo: TGenericNom = {
      nome: req.body?.nome?.toUpperCase() || "",
      cognome: req.body?.cognome?.toUpperCase() || "",
      ditta: req.body?.ditta?.toUpperCase() || "",
      telefono: req.body?.telefono?.toUpperCase() || "",
      tdoc: req.body?.tdoc?.toUpperCase() || "",
      ndoc: req.body?.ndoc?.toUpperCase() || "",
      scadenza: req.body?.scadenza || "",
      targhe: {
        1: req.body?.targa1?.toUpperCase() || "",
        2: req.body?.targa2?.toUpperCase() || "",
        3: req.body?.targa3?.toUpperCase() || "",
        4: req.body?.targa4?.toUpperCase() || ""
      }
    };

    // default badge document setup
    const badgeDoc: TGenericBadge = {
      barcode: req.body.barcode.toUpperCase(),
      descrizione: "",
      tipo: req.body.tipo.toUpperCase(),
      assegnazione: "UTENTE",
      stato: "VALIDO",
      ubicazione: "",
      nominativo,
    };

    console.log("apiPostArchivio | badgeDoc: ", badgeDoc);

    try {
      const archivioResponse = await ArchivioDAO.timbra(badgeDoc, cliente, postazione, ip);

      if ("error" in archivioResponse) {
        return res
          .status(400)
          .json({ success: false, msg: archivioResponse.error, data: null });
      }

      res.json({
        success: true,
        msg: archivioResponse.msg,
        data: archivioResponse.response,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostArchivio |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiGetInStruttura(req: Request, res: Response) {
    const tipo = Badge.toBadgeTipo(req.query.tipo);
    try {
      const archivioList = await ArchivioDAO.getInStrutt(tipo);
      res.json({ success: true, data: archivioList, msg: "Lista dipendenti in struttura ottenuta con successo" });
    } catch (err) {
      const { error } = errCheck(err, "apiGetInStruttura |");
      res
        .status(500)
        .json({ success: false, msg: error, data: [] });
    }
  }
  
}

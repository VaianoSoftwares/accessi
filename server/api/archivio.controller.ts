import ArchivioDAO from "../dao/archivio.dao.js";
import Validator from "../auth/validation.js";
import { Request, Response } from "express";
import errCheck from "../utils/errCheck.js";

export default class ArchivioController {

  static async apiGetArchivio(req: Request, res: Response) {
    try {
      // console.log("apiGetArchivio | req.query: ", req.query);
      const archivioResponse = await ArchivioDAO.getArchivio(req.query);
      // console.log("apiGetArchivio | archivioResponse: ", archivioResponse);
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

    const barcode = (req.body.barcode as string).toUpperCase();

    const { cliente, postazione } = req.body;
    // get address of client machine requesting for "timbra"
    const { ip } = req;

    try {
      const archivioResponse = await ArchivioDAO.timbra(barcode, cliente, postazione, ip);

      if ("error" in archivioResponse) {
        return res
          .status(400)
          .json({ success: false, msg: archivioResponse.error, data: null });
      }

      console.log(archivioResponse);

      res.json({
        success: true,
        msg: (archivioResponse as any).msg,
        data: archivioResponse,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostArchivio |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiGetInStruttura(req: Request, res: Response) {
    const cliente = req.query?.cliente as string || "";
    const postazione = req.query?.postazione as string || "";

    try {
      const archivioList = await ArchivioDAO.getInStrutt(cliente, postazione);
      res.json({ success: true, data: archivioList, msg: "Lista dipendenti in struttura ottenuta con successo" });
    } catch (err) {
      const { error } = errCheck(err, "apiGetInStruttura |");
      res
        .status(500)
        .json({ success: false, msg: error, data: [] });
    }
  }
  
}

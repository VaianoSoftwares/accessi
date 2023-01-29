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
    const parsed = Validator.timbra(req.body);
    if (parsed.success === false) {
      console.error("apiPostArchivio | error:", parsed.error);
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.message, data: null });
    }

    try {
      const archivioResponse = await ArchivioDAO.timbra(
        parsed.data.barcode.toUpperCase(),
        parsed.data.cliente,
        parsed.data.postazione,
        req.ip,
      );

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
    const parsed = Validator.getInStrutt(req.query);
    if (parsed.success === false) {
      console.error("apiGetinStruttura | error:", parsed.error);
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.message, data: null });
    }

    try {
      const archivioList = await ArchivioDAO.getInStrutt(
        parsed?.data?.cliente,
        parsed?.data?.postazione,
        parsed?.data?.tipi,
      );
      
      // console.log("apiGetInStruttura |", archivioList);

      res.json({ success: true, data: archivioList, msg: "Lista dipendenti in struttura ottenuta con successo" });
    } catch (err) {
      const { error } = errCheck(err, "apiGetInStruttura |");
      res
        .status(500)
        .json({ success: false, msg: error, data: [] });
    }
  }
  
}

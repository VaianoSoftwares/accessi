import { Request, Response } from "express";
import Validator from "../auth/validation.js";
import PrestitiDAO from "../dao/prestiti.dao.js";
import errCheck from "../utils/errCheck.js";

export default class PrestitiController {
  static async apiGetArchivioChiave(req: Request, res: Response) {
    try {
      console.log("apiGetArchivioChiave | req.query: ", req.query);
      const archivioResponse = await PrestitiDAO.getArchivioChiave(req.query);
      console.log(
        "apiGetArchivioChiave | archivioResponse: ",
        archivioResponse
      );
      res.json({
        success: true,
        data: archivioResponse,
        filters: req.query,
        msg: "Archivio ottenuto con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetArchivioChiave |");
      res.status(500).json({
        success: false,
        data: [],
        filters: req.query,
        msg: error,
      });
    }
  }

  static async apiPostArchivioChiave(req: Request, res: Response) {
    const valErr = Validator.prestitoChiave(req.body).error;
    if (valErr) {
      return res
        .status(400)
        .json({ success: false, msg: valErr.details[0].message, data: null });
    }

    try {
        const response = await PrestitiDAO.prestitoChiavi(
            req.body.barcodes as Array<string>,
            req.body.cliente as string,
            req.body.postazione as string,
            req.ip
        );
        if("error" in response) {
            return res.status(400).json({
                success: false,
                msg: response.error
            });
        }

        res.json({
            success: true,
            msg: "Prestito chiave avvenuto con successo",
            data: response
        });
    } catch(err) {
        const { error } = errCheck(err, "apiPostArchivioChiave |");
        res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiGetInPrestito(req: Request, res: Response) {
    try {
      const inPrestitoArr = await PrestitiDAO.getInPrestito();
      res.json({
        success: true,
        data: inPrestitoArr,
        msg: "Lista chiavi in prestito ottenuta con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetInPrestito |");
      res.status(500).json({ success: false, msg: error, data: [] });
    }
  }
}
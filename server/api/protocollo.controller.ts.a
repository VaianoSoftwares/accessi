import { Request, Response } from "express";
import Validator from "../auth/validation.js";
import errCheck from "../utils/errCheck.js";
import FileManager from "./badges.filemanager.js";
import { ObjectId } from "mongodb";
import ProtocolloDAO from "../dao/protocollo.dao.js";
import { ProtocolloAddReq, ProtocolloFindReq } from "../types/protocollo.js";

export default class ProtocolloController {
  static async apiGetProtocollo(req: Request, res: Response) {
    const parsed = Validator.postProtocollo(req.query);
    if (parsed.success === false) {
      return res.status(400).json({
        success: false,
        msg: parsed.error.message,
      });
    }

    try {
      const filters = {
        ...parsed.data,
        visibileDa: parsed.data.visibileDa.map(
          (postazione) => new ObjectId(postazione)
        ),
      } satisfies ProtocolloFindReq;

      const fileResp = await ProtocolloDAO.getFiles(filters);

      res.json({
        success: true,
        msg: "File ottenuti con successo.",
        data: fileResp,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetProtocollo |");
      res.status(500).json({
        success: false,
        msg: error,
        data: [],
      });
    }
  }

  static async apiPostProtocollo(req: Request, res: Response) {
    const parsed = Validator.postProtocollo(req.body);
    if (parsed.success === false) {
      return res.status(400).json({
        success: false,
        msg: parsed.error.message,
      });
    }

    try {
      const fileResp = await FileManager.uploadProtocolloFile(req.files);
      if ("error" in fileResp) {
        return res.status(400).json({
          success: false,
          msg: fileResp.error,
        });
      }

      const postData = {
        ...parsed.data,
        filename: fileResp.filename,
        visibileDa: parsed.data.visibileDa.map(
          (postazione) => new ObjectId(postazione)
        ),
      } satisfies ProtocolloAddReq;

      const protocolloResp = await ProtocolloDAO.addFile(postData);
      if ("error" in protocolloResp) {
        return res.status(400).json({
          success: false,
          msg: protocolloResp.error,
        });
      }

      res.json({
        success: true,
        msg: "File caricato con successo.",
        data: protocolloResp,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostProtocollo |");
      res.status(500).json({
        success: false,
        msg: error,
      });
    }
  }

  static async apiDeleteProtocollo(req: Request, res: Response) {
    const parsed = Validator.deleteProtocollo(req.query);
    if (parsed.success === false) {
      return res.status(400).json({
        success: false,
        msg: parsed.error.message,
      });
    }

    const { id, filename } = parsed.data;

    try {
      const fileResp = await FileManager.deleteProtocolloFile(filename);
      if ("error" in fileResp) {
        return res.status(400).json({
          success: false,
          msg: fileResp.error,
        });
      }

      const protocolloResp = await ProtocolloDAO.deleteFile(id);
      if ("error" in protocolloResp) {
        return res.status(400).json({
          success: false,
          msg: protocolloResp.error,
        });
      }

      res.json({
        success: true,
        msg: "File eliminato con successo.",
        data: { id, filename },
      });
    } catch (err) {
      const { error } = errCheck(err, "apiDeleteProtocollo |");
      res.status(500).json({
        success: false,
        msg: error,
      });
    }
  }
}

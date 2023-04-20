import { Request, Response } from "express";
import PermessiDAO from "../dao/permessi.dao.js";
import errCheck from "../utils/errCheck.js";
import { TPermesso, TPermessoReq } from "../types/users.js";

export default class PermessiController {
  static async apiGetPermessi(req: Request, res: Response) {
    try {
      const permessiList = await PermessiDAO.getPermessi(
        req.query as TPermessoReq
      );

      res.json({
        success: true,
        data: permessiList,
        filters: req.query,
        msg: "Permessi ottenuti con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetPermessi |");

      res.status(500).json({
        success: false,
        data: [],
        filters: req.query,
        msg: error,
      });
    }
  }

  static async apiPostPermessi(req: Request, res: Response) {
    const { username, date } = req.body;

    try {
      if (!username) throw Error("missing field: username");
      if (!date) throw Error("missing field: date");

      const permessoDoc: TPermesso = {
        username,
        date,
      };

      const permessiResponse = await PermessiDAO.addPermesso(permessoDoc);

      if ("error" in permessiResponse) throw new Error(permessiResponse.error);

      res.json({
        success: true,
        msg: "Permesso aggiunto con successo",
        data: permessiResponse,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostPermessi |");

      res.status(500).json({
        success: false,
        msg: error,
        data: null,
      });
    }
  }

  static async apiDeletePermessi(req: Request, res: Response) {
    const { _id } = req.query;

    try {
      if (!_id) throw Error("missing field: _id");

      const permessiResponse = await PermessiDAO.deletePermesso(_id as string);

      if ("error" in permessiResponse) throw new Error(permessiResponse.error);

      res.json({
        success: true,
        msg: "Permesso eliminato con successo",
        data: permessiResponse,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiDeletePermessi |");

      res.status(500).json({
        success: false,
        msg: error,
        data: null,
      });
    }
  }
}

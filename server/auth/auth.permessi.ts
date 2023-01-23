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

      const response = {
        success: true,
        data: permessiList,
        filters: req.query,
        msg: "Permessi ottenuti con successo",
      };
      
      res.json(response);
    } catch (err) {
      const { error } = errCheck(err, "apiGetPermessi |");
      const response = {
        success: false,
        data: [],
        filters: req.query,
        msg: error,
      };
      res.status(500).json(response);
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

      if("error" in permessiResponse)
        throw new Error(permessiResponse.error);

      const response = {
        success: true,
        msg: "Permesso aggiunto con successo",
        data: permessiResponse,
      };
      res.json(response);
    } catch (err) {
      const { error } = errCheck(err, "apiPostPermessi |");
      const response = {
        success: false,
        msg: error,
        data: null,
      };
      res.status(500).json(response);
    }
  }

  static async apiDeletePermessi(req: Request, res: Response) {
    const { username, date } = req.query;

    try {
      if (!username) throw Error("missing field: username");
      if (!date) throw Error("missing field: date");

      const permessoDoc: TPermesso = {
        username: username as string,
        date: username as string,
      };

      const permessiResponse = await PermessiDAO.deletePermesso(permessoDoc);

      if("error" in permessiResponse)
        throw new Error(permessiResponse.error);

      const response = {
        success: true,
        msg: "Permesso eliminato con successo",
        data: permessiResponse,
      };
      res.json(response);
    } catch (err) {
      const { error } = errCheck(err, "apiDeletePermessi |");
      const response = {
        success: false,
        msg: error,
        data: null,
      };
      res.status(500).json(response);
    }
  }
}
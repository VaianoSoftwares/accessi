import PermessiDAO from "../dao/permessi.dao.js";

export default class PermessiController {
  static async apiGetPermessi(req, res) {
    try {
      const permessiList = await PermessiDAO.getPermessi(req.query);
      const response = {
        success: true,
        data: permessiList,
        filters: req.query,
        msg: "Permessi ottenuti con successo",
      };
      res.json(response);
    } catch (err) {
      console.log("apiGetPermessi | ", err);
      const response = {
        success: false,
        data: [],
        filters: req.query,
        msg: err.msg,
      };
      res.status(500).json(response);
    }
  }

  static async apiPostPermessi(req, res) {
    const { username, date } = req.body;

    try {
      if (!username) throw Error("missing field: username");
      if (!date) throw Error("missing field: date");

      const permessoDoc = {
        username,
        date,
      };

      const permessiResponse = await PermessiDAO.addPermesso(permessoDoc);
      const { error } = permessiResponse;
      if (error) throw Error(error.msg);

      const response = {
        success: true,
        msg: "Permesso aggiunto con successo",
        data: permessiResponse,
      };
      res.json(response);
    } catch (err) {
      console.log("apiPostPermessi | ", err);
      const response = {
        success: false,
        msg: err.msg,
        data: null,
      };
      res.status(500).json(response);
    }
  }

  static async apiDeletePermessi(req, res) {
    const { username, date } = req.query;

    try {
      if (!username) throw Error("missing field: username");
      if (!date) throw Error("missing field: date");

      const permessoDoc = {
        username,
        date,
      };

      const permessiResponse = await PermessiDAO.deletePermesso(permessoDoc);
      const { error } = permessiResponse;
      if (error) throw Error(error.msg);

      const response = {
        success: true,
        msg: "Permesso eliminato con successo",
        data: permessiResponse,
      };
      res.json(response);
    } catch (err) {
      console.log("apiDeletePermessi | ", err);
      const response = {
        success: false,
        msg: err.msg,
        data: null,
      };
      res.status(500).json(response);
    }
  }
}
import ArchivioDAO from "../dao/archivio.dao.js";
import Validator from "../auth/validation.js";

export default class ArchivioController {
  static async apiGetArchivio(req, res) {
    const { inizio, fine } = req.query;
    try {
      const archivioResponse = await ArchivioDAO.getArchivio(inizio, fine);
      res.json({
        success: true,
        data: archivioResponse,
        filters: { inizio, fine },
      });
    } catch (err) {
      console.log(`apiGetArchivio - ${err}`);
      res.status(500).json({
        success: false,
        data: [],
        filters: { inizio, fine },
        msg: err.msg,
      });
    }
  }

  static async apiPostArchivio(req, res) {
    const valErr = Validator.timbra(req.body).error;
    if(valErr) {
      return res.status(400).json({ success: false, msg: valErr.details[0].message });
    }

    const { barcode, tipo, postazione } = req.body;

    const nominativo = {
      nome: req.body.nome,
      cognome: req.body.cognome,
      ditta: req.body.ditta,
      telefono: req.body.telefono,
      tdoc: req.body.tdoc,
      ndoc: req.body.ndoc,
      scadenza: req.body.scadenza,
      targhe: {
        1: req.body.targa1,
        2: req.body.targa2,
        3: req.body.targa3,
        4: req.body.targa4
      }
    };

    try {
      const archivioResponse = await ArchivioDAO.timbra(barcode, tipo, postazione, nominativo);

      const { error } = archivioResponse;
      if (error) {
        return res.status(400).json({ success: false, msg: error.message });
      }

      res.json({
        success: true,
        msg: archivioResponse.msg,
        data: archivioResponse.response,
      });
    } catch (err) {
      console.log(`apiPostArchivio - ${err}`);
      res.status(500).json({ success: false, msg: err.message });
    }
  }

  static async apiGetInStruttura(req, res) {
    const { tipo } = req.query;
    try {
      const archivioList = await ArchivioDAO.getInStrutt(tipo);
      res.json({ success: true, data: archivioList });
    } catch (err) {
      console.log(`apiGetInStruttura - ${err}`);
      res
        .status(500)
        .json({ success: false, msg: err.message, data: [] });
    }
  }
}

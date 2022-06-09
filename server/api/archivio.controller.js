import ArchivioDAO from "../dao/archivio.dao.js";
import Validator from "../auth/validation.js";

export default class ArchivioController {
  static async apiGetArchivio(req, res) {
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
      console.log(`apiGetArchivio - ${err}`);
      res.status(500).json({
        success: false,
        data: [],
        filters: req.query,
        msg: err.msg,
      });
    }
  }

  static async apiPostArchivio(req, res) {
    const valErr = Validator.timbra(req.body).error;
    if(valErr) {
      return res.status(400).json({ success: false, msg: valErr.details[0].message, data: null });
    }
    
    const barcode = req.body.barcode.toUpperCase();
    const tipo = req.body.tipo.toUpperCase();
    const { postazione } = req.body;

    const nominativo = {
      nome: req.body.nome.toUpperCase() || "",
      cognome: req.body.cognome.toUpperCase() || "",
      ditta: req.body.ditta.toUpperCase() || "",
      telefono: req.body.telefono.toUpperCase() || "",
      tdoc: req.body.tdoc.toUpperCase() || "",
      ndoc: req.body.ndoc.toUpperCase() || "",
      scadenza: req.body.scadenza || "",
      targhe: {
        1: req.body.targa1.toUpperCase() || "",
        2: req.body.targa2.toUpperCase() || "",
        3: req.body.targa3.toUpperCase() || "",
        4: req.body.targa4.toUpperCase() || ""
      }
    };

    console.log("apiPostArchivio | nominativo: ", nominativo);

    try {
      const archivioResponse = await ArchivioDAO.timbra(barcode, tipo, postazione, nominativo);

      const { error } = archivioResponse;
      if (error) {
        return res.status(400).json({ success: false, msg: error.message, data: null });
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
    const tipo = req.query.tipo.toUpperCase();
    try {
      const archivioList = await ArchivioDAO.getInStrutt(tipo);
      res.json({ success: true, data: archivioList, msg: "Lista dipendenti in struttura ottenuta con successo" });
    } catch (err) {
      console.log(`apiGetInStruttura - ${err}`);
      res
        .status(500)
        .json({ success: false, msg: err.message, data: [] });
    }
  }
}

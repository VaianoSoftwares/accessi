import ArchivioDAO from "../dao/archivio.dao.js";

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
    const { barcode } = req.body;
    if (!barcode) {
      return res
        .status(400)
        .json({ success: false, msg: "Barcode non compilato" });
    }

    const nominativo = {
      nome: req.body.nome,
      cognome: req.body.cognome,
      rag_soc: req.body.rag_soc,
      num_tel: req.body.num_tel,
      tipo_doc: req.body.tipo_doc,
      cod_doc: req.body.cod_doc,
      foto_profilo: req.body.foto_profilo,
    };

    try {
      const archivioResponse = await ArchivioDAO.timbra(barcode, nominativo);

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
  /*
  static async apiPutArchivio(req, res) {
    const { barcode } = req.body;

    try {
      const archivioResponse = await ArchivioDAO.timbraEsce(barcode);

      if (archivioResponse.modifiedCount === 0) {
        throw new Error("Non è stato possibile timbrare badge uscita");
      }

      res.json({ success: true, msg: "Timbra uscita", data: archivioResponse });
    } catch (err) {
      console.log(`apiPutArchivio - ${err}`);
      res.status(500).json({ success: false, msg: err.message });
    }
  }*/

  static async apiGetInStruttura(req, res) {
    try {
      const archivioList = await ArchivioDAO.getInStrutt();
      res.json({ success: true, data: archivioList });
    } catch (err) {
      console.log(`apiGetInStruttura - ${err}`);
      res
        .status(500)
        .json({ success: false, msg: err.message, data: [] });
    }
  }
}

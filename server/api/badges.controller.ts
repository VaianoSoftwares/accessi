import BadgesDAO from "../dao/badges.dao.js";
import FileManager from "./badges.filemanager.js";
import EnumsDAO from "../dao/enums.dao.js";
import Validator from "../auth/validation.js";
import { Request, Response } from "express";
import errCheck from "../utils/errCheck.js";
import { TAssegnaz } from "../types/enums.js";
import PostazioniDao from "../dao/postazioni.dao.js";

export default class BadgesController {
  static async apiGetBadges(req: Request, res: Response) {
    const parsed = Validator.findBadge(req.query);
    if (parsed.success === false) {
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.errors[0].message });
    }

    try {
      const badgesList = await BadgesDAO.getBadges(parsed.data);
      res.json({
        success: true,
        data: badgesList,
        filters: req.query,
        msg: "Badge ottenuti con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetBadges |");
      res.status(500).json({
        success: false,
        data: [],
        filters: req.query,
        msg: error,
      });
    }
  }

  static async apiPostBadges(req: Request, res: Response) {
    const parsed = Validator.insertBadge(req.body);
    if (parsed.success === false) {
      console.error("apiPostBadges | error:", parsed.error);
      return res.status(400).json({
        success: false,
        msg: parsed.error.errors[0].message,
      });
    }

    try {
      const badgesResponse = await BadgesDAO.addBadge(parsed.data);

      if ("error" in badgesResponse) {
        return res.status(400).json({
          success: false,
          msg: badgesResponse.error,
          data: null,
        });
      }

      const fileUplResp = await FileManager.uploadPfp(
        req.files,
        req.body.barcode,
        req.body.tipo
      );
      if ("error" in fileUplResp) {
        return res
          .status(400)
          .json({ success: false, msg: fileUplResp.error, data: null });
      }

      console.log(
        `apiPostBadge | Aggiunto badge ${badgesResponse.insertedId} con successo`
      );

      res.json({
        success: true,
        msg: "Badge aggiunto con successo",
        data: badgesResponse,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostBadge |");
      res.status(500).json({ success: false, msg: error, data: null });
    }
  }

  static async apiPutBadges(req: Request, res: Response) {
    const parsed = Validator.updateBadge(req.body);
    if (parsed.success === false) {
      console.error("apiPutBadges | error:", parsed.error);
      return res.status(400).json({
        success: false,
        msg: parsed.error.errors[0].message,
        data: null,
      });
    }

    try {
      const badgesResponse = await BadgesDAO.updateBadge(parsed.data);

      if ("error" in badgesResponse) {
        return res.status(400).json({
          success: false,
          msg: badgesResponse.error,
          data: null,
        });
      }

      const barcode = parsed.data.barcode.toUpperCase();

      const fileUplResp = await FileManager.uploadPfp(
        req.files,
        barcode,
        badgesResponse.tipoBadge
      );
      if ("error" in fileUplResp) {
        return res
          .status(400)
          .json({ success: false, msg: fileUplResp.error, data: null });
      } else if (badgesResponse.modifiedCount === 0 && !fileUplResp.fileName) {
        throw new Error(
          `Badge ${barcode} non aggiornato. Nessun campo inserito.`
        );
      }

      console.log(`apiPutBadge | Aggiornato badge ${barcode} con successo`);

      res.json({
        success: true,
        msg: "Badge aggiornato con successo.",
        data: badgesResponse,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPutBadges");
      res.status(500).json({ success: false, msg: error, data: null });
    }
  }

  static async apiDeleteBadges(req: Request, res: Response) {
    const parsed = Validator.deleteBadge(req.query);
    if (parsed.success === false) {
      console.error("apiDeleteBadges | error:", parsed.error);
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.errors[0].message });
    }

    const barcode = parsed.data.barcode.toUpperCase();

    try {
      const badgesResponse = await BadgesDAO.deleteBadge(barcode);

      if ("error" in badgesResponse) {
        throw new Error(
          `Badge ${barcode} non eliminato - ${badgesResponse.error}`
        );
      } else if (
        "deletedCount" in badgesResponse &&
        badgesResponse.deletedCount === 0
      ) {
        throw new Error(
          `Badge ${barcode} non eliminato - Barcode non esistente`
        );
      }

      const delPfpResp = await FileManager.deletePfp(barcode);

      if (delPfpResp?.error) {
        throw new Error(
          `Badge ${barcode} - Non e' stato possibile eliminare pfp`
        );
      }

      console.log(`apiDeleteBadge | Rimosso badge ${barcode} con successo`);

      res.json({
        success: true,
        msg: "Badge eliminato con successo.",
        data: badgesResponse,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiDeleteBadges |");
      res.status(500).json({ success: false, msg: error, data: null });
    }
  }

  static async apiGetAssegnazioni(req: Request, res: Response) {
    try {
      const assegnazioni = await EnumsDAO.getAssegnazioni();
      res.json({
        success: true,
        data: assegnazioni,
        msg: "Assegnazioni ottenute con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetAssegnazioni |");
      res.status(500).json({ success: false, data: null, msg: error });
    }
  }

  static async apiPostAssegnazioni(req: Request, res: Response) {
    try {
      const parsed = Validator.assegnazioni(req.body);
      if (parsed.success === false) {
        console.error("apiPostAssegnazioni | error:", parsed.error);
        return res
          .status(400)
          .json({ success: false, msg: parsed.error.errors[0].message });
      }

      const assegnazObj: TAssegnaz = {
        badge: parsed.data.badge,
        name: parsed.data.name.toUpperCase(),
      };

      const enumResp = await EnumsDAO.pushAssegnaz([assegnazObj]);
      if ("error" in enumResp) {
        return res.status(400).json({ success: false, msg: enumResp.error });
      } else if (enumResp.modifiedCount === 0) {
        throw new Error(
          `Non è stato possibile inserire ${assegnazObj.name} in ${assegnazObj.badge}`
        );
      }
      return res.json({
        success: true,
        msg: `Assegnazione di tipo ${assegnazObj.badge} inserita con successo`,
        data: enumResp,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostAssegnazioni |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiDeleteAssegnazioni(req: Request, res: Response) {
    try {
      const parsed = Validator.assegnazioni(req.query);
      if (parsed.success === false) {
        console.error("apiDeleteAssegnazioni | error:", parsed.error);
        return res
          .status(400)
          .json({ success: false, msg: parsed.error.errors[0].message });
      }

      const assegnazObj: TAssegnaz = {
        badge: parsed.data.badge,
        name: parsed.data.name.toUpperCase(),
      };

      const enumResp = await EnumsDAO.pullAssegnaz([assegnazObj]);
      if ("error" in enumResp) {
        return res.status(400).json({ success: false, msg: enumResp.error });
      } else if (enumResp.modifiedCount === 0) {
        throw new Error(
          `Non è stato possibile eliminare ${assegnazObj.name} in ${assegnazObj.badge}`
        );
      }
      return res.json({
        success: true,
        msg: `Assegnazione di tipo ${assegnazObj.badge} eliminata con successo`,
        data: enumResp,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiDeleteAssegnazioni |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiGetPostazioni(req: Request, res: Response) {
    const parsed = Validator.getPostazioni(req.query);
    if (parsed.success === false) {
      console.error("apiGetPostazioni | error:", parsed.error);
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.errors[0].message });
    }

    try {
      const postazioni = await PostazioniDao.getPostazioni(parsed.data);
      res.json({
        success: true,
        data: postazioni,
        msg: "Postazioni ottenuto con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetPostazioni |");
      res.status(500).json({ success: false, data: null, msg: error });
    }
  }

  static async apiPostPostazione(req: Request, res: Response) {
    const parsed = Validator.postPostazione(req.body);
    if (parsed.success === false) {
      console.error("apiPostPostazione | error:", parsed.error);
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.errors[0].message });
    }

    try {
      const response = await PostazioniDao.addPostazione(parsed.data);
      if ("error" in response) {
        return res.status(400).json({ success: false, msg: response.error });
      }

      res.json({
        success: true,
        data: response,
        msg: "Postazione inserita con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostPostazione |");
      res.status(500).json({ success: false, data: null, msg: error });
    }
  }

  static async apiDeletePostazione(req: Request, res: Response) {
    const { postazioneId } = req.params;

    try {
      const response = await PostazioniDao.deletePostazione(postazioneId);
      if ("error" in response) {
        return res.status(400).json({ success: false, msg: response.error });
      } else if (response.deletedCount === 0) {
        return res
          .status(400)
          .json({ success: false, msg: "Impossibile eliminare postazione" });
      }

      res.json({
        success: true,
        data: response,
        msg: "Postazione eliminata con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiDeletePostazione |");
      res.status(500).json({ success: false, data: null, msg: error });
    }
  }

  static async apiGetClienti(req: Request, res: Response) {
    try {
      const clienti = await EnumsDAO.getClienti();
      res.json({
        success: true,
        data: clienti,
        msg: "Clienti ottenute con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetClienti |");
      res.status(500).json({ success: false, data: null, msg: error });
    }
  }

  static async apiPostCliente(req: Request, res: Response) {
    const { cliente } = req.body;
    if (!cliente)
      return res
        .status(400)
        .json({ success: false, msg: "Campo Cliente mancante" });

    try {
      const response = await EnumsDAO.addCliente(cliente);
      if ("error" in response) {
        return res.status(400).json({ success: false, msg: response.error });
      }

      res.json({
        success: true,
        data: response,
        msg: "Cliente inserito con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiPostCliente |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiDeleteCliente(req: Request, res: Response) {
    const { cliente } = req.params;
    if (!cliente)
      return res
        .status(400)
        .json({ success: false, msg: "Campo Cliente mancante" });

    try {
      const response = await EnumsDAO.deleteCliente(cliente);
      if ("error" in response) {
        return res.status(400).json({ success: false, msg: response.error });
      }

      res.json({
        success: true,
        data: response,
        msg: "Cliente eliminato con successo",
      });
    } catch (err) {
      const { error } = errCheck(err, "apiDeleteCliente |");
      res.status(500).json({ success: false, msg: error });
    }
  }
}

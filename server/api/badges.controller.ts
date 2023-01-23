import BadgesDAO from "../dao/badges.dao.js";
import FileManager from "./badges.filemanager.js";
import EnumsDAO from "../dao/enums.dao.js";
import Validator from "../auth/validation.js";
import { Request, Response } from "express";
import errCheck from "../utils/errCheck.js";
import { GenericResponse } from "../types/responses.js";
import Badge, { TBadgeAddReq, TBadgeFindReq } from "../types/badges.js";
import { TAssegnaz } from "../types/enums.js";

export default class BadgesController {
    static async apiGetBadges(req: Request, res: Response) {
        let response: GenericResponse;

        try {
            const badgesList = await BadgesDAO.getBadges(req.query as TBadgeFindReq);
            response = {
                success: true,
                data: badgesList,
                filters: req.query,
                msg: "Badge ottenuti con successo"
            };
            res.json(response);
        } catch(err) {
            const { error } = errCheck(err, "apiGetBadges |");
            response = {
                success: false,
                data: [],
                filters: req.query,
                msg: error
            };
            res.status(500).json(response);
        }
    }

    static async apiPostBadges(req: Request, res: Response) {
        const valErr = Validator.badgeDoc(req.body).error;
        if (valErr) {
          return res
            .status(400)
            .json({
              success: false,
              msg: valErr.details[0].message,
              data: null,
            });
        }

        try {
            const badgesResponse = await BadgesDAO.addBadge(req.body as TBadgeAddReq);

            if("error" in badgesResponse) {
                return res
                  .status(400)
                  .json({
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

            console.log(`apiPostBadge | Aggiunto badge ${badgesResponse.insertedId} con successo`);

            res.json({
              success: true,
              msg: "Badge aggiunto con successo",
              data: badgesResponse,
            });
        } catch(err) {
            const { error } = errCheck(err, "apiPostBadge |");
            res.status(500).json({ success: false, msg: error, data: null });
        }
    }

    static async apiPutBadges(req: Request, res: Response) {
        const valErr = Validator.badgeDoc(req.body).error;
        if (valErr) {
          return res
            .status(400)
            .json({
              success: false,
              msg: valErr.details[0].message,
              data: null,
            });
        }

        try {
            const badgesResponse = await BadgesDAO.updateBadge(req.body);

            if("error" in badgesResponse) {
                return res
                  .status(400)
                  .json({
                    success: false,
                    msg: badgesResponse.error,
                    data: null,
                  });
            }

            const barcode: string = req.body.barcode.toUpperCase();

            const fileUplResp = await FileManager.uploadPfp(
              req.files,
              barcode,
              req.body.tipo.toUpperCase(),
            );
            if ("error" in fileUplResp) {
              return res
                .status(400)
                .json({ success: false, msg: fileUplResp.error, data: null });
            } else if (
              badgesResponse.modifiedCount === 0 &&
              !fileUplResp.fileName
            ) {
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
        } catch(err) {
            const { error } = errCheck(err, "apiPutBadges");
            res.status(500).json({ success: false, msg: error, data: null });
        }
    }

    static async apiDeleteBadges(req: Request, res: Response) {
        const barcode = (req.query.barcode as string).toUpperCase();

        try {
            const badgesResponse = await BadgesDAO.deleteBadge(barcode);

            if("error" in badgesResponse) {
              throw new Error(
                `Badge ${barcode} non eliminato - ${badgesResponse.error}`
              );
            }
            else if (
              "deletedCount" in badgesResponse &&
              badgesResponse.deletedCount === 0
            ) {
              throw new Error(
                `Badge ${barcode} non eliminato - Barcode non esistente`
              );
            }

            const delPfpResp = await FileManager.deletePfp(barcode);

            if(delPfpResp?.error) {
                throw new Error(`Badge ${barcode} - Non e' stato possibile eliminare pfp`);
            }

            console.log(`apiDeleteBadge | Rimosso badge ${barcode} con successo`);

            res.json({
              success: true,
              msg: "Badge eliminato con successo.",
              data: badgesResponse,
            });
        } catch(err) {
            const { error } = errCheck(err, "apiDeleteBadges |");
            res.status(500).json({ success: false, msg: error, data: null });
        }
    }

    static async apiGetEnums(req: Request, res: Response) {
        try {
            const enums = await EnumsDAO.getEnums();
            res.json({ success: true, data: enums, msg: "Enums ottenuti con successo" });
        } catch(err) {
            const { error } = errCheck(err, "apiGetEnums |");
            res.status(500).json({ success: false, data: null, msg: error });
        }
    }

    static async apiPostAssegnazioni(req: Request, res: Response) {
        try {
            const { error } = Validator.enumDoc(req.body);
            if (error) {
              return res
                .status(400)
                .json({ success: false, msg: error.details[0].message });
            }

            const assegnazObj: TAssegnaz = {
                badge: Badge.toBadgeTipo(req.body.badge),
                name: req.body.name.toUpperCase()
            };
            
            const enumResp = await EnumsDAO.pushAssegnaz([assegnazObj]);
            if ("error" in enumResp) {
              return res
                .status(400)
                .json({ success: false, msg: enumResp.error });
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
        } catch(err) {
            const { error } = errCheck(err, "apiPostAssegnazioni |");
            res.status(500).json({ success: false, msg: error });
        }
    }

    static async apiDeleteAssegnazioni(req: Request, res: Response) {
        try {
            const { error } = Validator.enumDoc(req.query);
            if(error) {
                return res
                  .status(400)
                  .json({ success: false, msg: error.details[0].message });
            }

            const assegnazObj: TAssegnaz = {
                badge: Badge.toBadgeTipo(req.query.badge),
                name: (req.query.name as string).toUpperCase()
            };

            const enumResp = await EnumsDAO.pullAssegnaz([assegnazObj]);
            if("error" in enumResp) {
                return res.status(400).json({ success: false, msg: error });
            }
            else if(enumResp.modifiedCount === 0) {
                throw new Error(
                  `Non è stato possibile eliminare ${assegnazObj.name} in ${assegnazObj.badge}`
                );
            }
            return res.json({
              success: true,
              msg: `Assegnazione di tipo ${assegnazObj.badge} eliminata con successo`,
              data: enumResp,
            });
        } catch(err) {
            const { error } = errCheck(err, "apiDeleteAssegnazioni |");
            res.status(500).json({ success: false, msg: error });
        }
    }
}
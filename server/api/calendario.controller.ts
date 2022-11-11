import { Request, Response } from "express";
import Validator from "../auth/validation";
import errCheck from "../middlewares/errCheck";
import FileManager from "./badges.filemanager";

export default class CalendarioController {

    static async apiPostCalendario(req: Request, res: Response) {
        const valErr = Validator.postCalendario(req.body).error;
        if(valErr) {
            return res
            .status(400)
            .json({
              success: false,
              msg: valErr.details[0].message,
            });
        }

        const date = req.body.date as string;

        try {
            const fileResp = await FileManager.uploadCalendarioFiles(req.files, date);
            if("error" in fileResp) {
                return res.status(400).json({
                    success: false,
                    msg: fileResp.error
                });
            }

            res.json({
                success: true,
                msg: "File caricati con successo.",
                data: fileResp.filenames
            })
        } catch(err) {
            const { error } = errCheck(err, "apiPostCalendario |");
            res.status(500).json({
                success: false,
                msg: error
            });
        }
    }

    static async apiDeleteCalendario(req: Request, res: Response) {
        const valErr = Validator.postCalendario(req.query).error;
        if(valErr) {
            return res
            .status(400)
            .json({
              success: false,
              msg: valErr.details[0].message,
            });
        }

        const { filename, date } = req.query;

        try {
            const fileResp = await FileManager.deleteCalendarioFile(filename as string, date as string);
            if("error" in fileResp) {
                return res.status(400).json({
                    success: false,
                    msg: fileResp.error
                });
            }

            res.json({
                success: true,
                msg: "File eliminato con successo.",
                data: fileResp.filename
            })
        } catch(err) {
            const { error } = errCheck(err, "apiDeleteCalendario |");
            res.status(500).json({
                success: false,
                msg: error
            });
        }
    }
    
}
import { Request, Response } from "express";
import Validator from "../auth/validation.js";
import errCheck from "../utils/errCheck.js";
import FileManager from "./badges.filemanager.js";

export default class CalendarioController {

    static async apiGetCalendario(req: Request, res: Response) {
        const parsed = Validator.postCalendario(req.query);
        if(parsed.success === false) {
            return res
            .status(400)
            .json({
              success: false,
              msg: parsed.error.message,
            });
        }

        try {
            const fileResp = await FileManager.getFilenamesByDate(parsed.data.date);
            res.json({
                success: true,
                msg: "File ottenuti con successo.",
                data: fileResp
            });
        } catch(err) {
            const { error } = errCheck(err, "apiGetCalendario |");
            res.status(500).json({
                success: false,
                msg: error,
                data: []
            });
        }
    }

    static async apiPostCalendario(req: Request, res: Response) {
        const parsed = Validator.postCalendario(req.body);
        if(parsed.success === false) {
            return res
            .status(400)
            .json({
              success: false,
              msg: parsed.error.message,
            });
        }
        
        try {
            const fileResp = await FileManager.uploadCalendarioFiles(
              req.files,
              parsed.data.date
            );
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
        const parsed = Validator.deleteCalendario(req.query);
        if(parsed.success === false) {
            return res
            .status(400)
            .json({
              success: false,
              msg: parsed.error.message,
            });
        }

        const { filename, date } = parsed.data;

        try {
            const fileResp = await FileManager.deleteCalendarioFile(filename, date);
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
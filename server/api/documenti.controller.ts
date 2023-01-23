import DocumentiDAO from "../dao/documenti.dao.js";
import Validator from "../auth/validation.js";
import FileManager from "./badges.filemanager.js";
import { Request, Response } from "express";
import { GenericResponse } from "../types/responses.js";
import errCheck from "../utils/errCheck.js";
import { TDocumento, TDocumentoReq, TDocUpdReq } from "../types/documenti.js";

export default class DocumentiController {

    static async apiGetDocumenti(req: Request, res: Response) {
        let response: GenericResponse;

        try {
            const docsList = await DocumentiDAO.getDocumenti(
              req.query as TDocumentoReq
            );
            response = {
                success: true,
                data: docsList,
                filters: req.query,
                msg: "Documenti ottenuti con successo"
            }
            res.json(response);
        } catch(err) {
            const { error } = errCheck(err, "apiGetDocumenti |");
            response = {
                success: false,
                data: [],
                filters: req.query,
                msg: error
            };
            res.status(500).json(response);
        }
    }

    static async apiPostDocumenti(req: Request, res: Response) {
        const valErr = Validator.postDocumento(req.body).error;
        if(valErr) {
            return res.status(400).json({ 
                success: false,
                msg: valErr.details[0].message,
                data: null 
            });
        }

        const docToAdd: TDocumento = {
            codice: req.body.codice.toUpperCase(),
            nome: req.body.nome.toUpperCase(),
            cognome: req.body.cognome.toUpperCase(),
            azieda: req.body.azienda.toUpperCase(),
            filename: ""
        };

        try {
            const fileUplResp = await FileManager.uploadDocumento(
                req.files, docToAdd.codice
            );

            if("error" in fileUplResp) {
                return res.status(400).json({
                    success: false,
                    msg: fileUplResp.error,
                    data: null 
                });
            }

            docToAdd.filename = fileUplResp.filename;

            const docResponse = await DocumentiDAO.addDocumento(docToAdd);

            if("error" in docResponse) {
                return res.status(400).json({
                    success: false,
                    msg: docResponse.error,
                    data: null 
                });
            }

            res.json({
                success: true,
                msg: "Documento caricato con successo.",
                data: docToAdd,
            });
        } catch(err) {
            const { error } = errCheck(err, "apiPostDocumenti |");
            res.status(500).json({ 
                success: false,
                msg: error,
                data: null 
            });
        }
    }

    static async apiPutDocumenti(req: Request, res: Response) {
        const valErr = Validator.putDocumento(req.body).error;
        if(valErr) {
            return res.status(400).json({ 
                success: false,
                msg: valErr.details[0].message,
                data: null 
            });
        }

        const docToUpd: TDocUpdReq = {
            codice: req.body.codice.toUpperCase(),
            nome: req.body?.nome?.toUpperCase(),
            cognome: req.body?.cognome?.toUpperCase(),
            azieda: req.body?.azienda?.toUpperCase(),
        };

        try {
            const fileUplResp = await FileManager.uploadDocumento(
                req.files, docToUpd.codice
            );

            if(
              "error" in fileUplResp &&
              !fileUplResp.error.includes("Nessun file selezionato")
            ) {
              return res.status(400).json({
                success: false,
                msg: fileUplResp.error,
                data: null,
              });
            }

            if("filename" in fileUplResp)
                docToUpd.filename = fileUplResp.filename;

            const docResponse = await DocumentiDAO.updateDocumento(docToUpd);
            console.log(docResponse);

            if("error" in docResponse) {
                return res.status(400).json({
                    success: false,
                    msg: docResponse.error,
                    data: null 
                });
            }

            const updatedDoc = await DocumentiDAO.getDocById(
              docResponse.updatedId
            );

            res.json({
                success: true,
                msg: "Documento aggiornato con successo.",
                data: updatedDoc,
            });
        } catch(err) {
            const { error } = errCheck(err, "apiPutDocumenti |");
            res.status(500).json({ 
                success: false,
                msg: error,
                data: null 
            });
        }
    }

    static async apiDeleteDocumenti(req: Request, res: Response) {
        if(typeof req.query.codice !== "string") {
            return res.status(400).json({
                success: false,
                msg: "Codice documento non specificato.",
                data: null
            });
        }

        const codice = req.query.codice.toUpperCase();
        
        try {
            const docResponse = await DocumentiDAO.deleteDocumento(codice);
            if("error" in docResponse) {
                throw new Error(docResponse.error);
            }
            if(docResponse.deletedCount === 0) {
                throw new Error(`Documento ${codice} non è stato eliminato.`);
            }

            const fileDelResp = await FileManager.deleteDocumento(codice);
            if(fileDelResp?.error) {
                throw new Error(
                    `Documento ${codice} (file) non è stato eliminato.`
                );
            }

            res.json({
                success: true,
                msg: `Documento ${codice} eliminato con successo.`,
                data: { deletedCodice: codice }
            });
        } catch(err) {
            const { error } = errCheck(err, "apiDeleteDocumenti |");
            res.status(500).json({ 
                success: false,
                msg: error,
                data: null 
            });
        }
    }

}
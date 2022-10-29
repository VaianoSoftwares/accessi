import DocumentiDAO from "../dao/documenti.dao.js";
import Validator from "../auth/validation.js";
import FileManager from "./badges.filemanager.js";

export default class DocumentiController {

    static async apiGetDocumenti(req, res) {
        let response;

        try {
            const docsList = await DocumentiDAO.getDocumenti(req.query);
            response = {
                success: true,
                data: docsList,
                filters: req.query,
                msg: "Documenti ottenuti con successo"
            }
            res.json(response);
        } catch(err) {
            console.error(`apiGetDocumenti - ${err}`);
            response = {
                success: false,
                data: [],
                filters: req.query,
                msg: err.msg
            };
            res.status(500).json(response);
        }
    }

    static async apiPostDocumenti(req, res) {
        const valErr = Validator.postDocumento(req.body).error;
        if(valErr) {
            return res.status(400).json({ 
                success: false,
                msg: valErr.details[0].message,
                data: null 
            });
        }

        const docToAdd = {
            codice: codice.toUpperCase(),
            nome: nome.toUpperCase(),
            cognome: cognome.toUpperCase(),
            azieda: azienda.toUpperCase()
        };

        try {
            const docResponse = await DocumentiDAO.addDocumento(docToAdd);

            const respErr = docResponse.error;
            if(respErr) {
                return res.status(400).json({
                    success: false,
                    msg: respErr.message,
                    data: null 
                });
            }

            const fileUplResp = await FileManager.uploadDocument(
                docToAdd.codice
            );

            const fileUplErr = fileUplResp.error;
            if(fileUplErr) {
                await DocumentiDAO.deleteDocumento(docToAdd.codice);

                return res.status(400).json({
                    success: false,
                    msg: fileUplErr.message,
                    data: null 
                });
            }

            res.json({
                success: true,
                msg: "Documento caricato con successo.",
                data: docResponse,
            });
        } catch(err) {
            console.error(err);
            res.status(500).json({ 
                success: false,
                msg: err.message,
                data: null 
            });
        }
    }

    static async apiPutDocumenti(req, res) {
        const valErr = Validator.putDocumento(req.body).error;
        if(valErr) {
            return res.status(400).json({ 
                success: false,
                msg: valErr.details[0].message,
                data: null 
            });
        }

        const docToUpd = {
            codice: codice.toUpperCase(),
            nome: nome?.toUpperCase(),
            cognome: cognome?.toUpperCase(),
            azieda: azienda?.toUpperCase()
        };

        try {
            const docResponse = await DocumentiDAO.updateDocumento(docToUpd);

            const respErr = docResponse.error;
            if(respErr) {
                return res.status(400).json({
                    success: false,
                    msg: respErr.message,
                    data: null 
                });
            }

            const fileUplResp = await FileManager.uploadDocument(
                docToAdd.codice
            );

            const fileUplErr = fileUplResp.error;
            if(fileUplErr) {
                return res.status(400).json({
                    success: false,
                    msg: fileUplErr.message,
                    data: null 
                });
            }

            res.json({
                success: true,
                msg: "Documento aggiornato con successo.",
                data: docResponse,
            });
        } catch(err) {
            console.error(err);
            res.status(500).json({ 
                success: false,
                msg: err.message,
                data: null 
            });
        }
    }

    static async apiDeleteDocumenti(req, res) {
        const { codice } = req.query;
        
        try {
            const docResponse = await DocumentiDAO.deleteDocumento(codice);
            if(docResponse.deletedCount === 0) {
                throw new Error(`Documento ${codice} non è stato eliminato.`);
            }

            const { error } = await FileManager.deleteDocumento(codice);
            if(error) {
                throw new Error(
                    `Documento ${codice} (file) non è stato eliminato.`
                );
            }

            res.json({
                success: true,
                msg: `Documento ${codice} eliminato con successo.`,
                data: docResponse
            });
        } catch(err) {
            console.error(err);
            res.status(500).json({ 
                success: false,
                msg: err.message,
                data: null 
            });
        }
    }

}
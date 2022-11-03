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
            codice: req.body.codice.toUpperCase(),
            nome: req.body.nome.toUpperCase(),
            cognome: req.body.cognome.toUpperCase(),
            azieda: req.body.azienda.toUpperCase(),
        };

        try {
            const fileUplResp = await FileManager.uploadDocumento(
                req.files, docToAdd.codice
            );

            const fileUplErr = fileUplResp.error;
            if(fileUplErr) {
                return res.status(400).json({
                    success: false,
                    msg: fileUplErr.message,
                    data: null 
                });
            }

            docToAdd.filename = fileUplResp.filename;

            const docResponse = await DocumentiDAO.addDocumento(docToAdd);

            const respErr = docResponse.error;
            if(respErr) {
                return res.status(400).json({
                    success: false,
                    msg: respErr.message,
                    data: null 
                });
            }

            res.json({
                success: true,
                msg: "Documento caricato con successo.",
                data: docToAdd,
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
            codice: req.body.codice.toUpperCase(),
            nome: req.body?.nome?.toUpperCase(),
            cognome: req.body?.cognome?.toUpperCase(),
            azieda: req.body?.azienda?.toUpperCase()
        };

        try {
            const fileUplResp = await FileManager.uploadDocumento(
                req.files, docToUpd.codice
            );

            const fileUplErr = fileUplResp.error;
            if(
              fileUplErr &&
              !fileUplErr.message.includes("Nessun file selezionato")
            ) {
              return res.status(400).json({
                success: false,
                msg: fileUplErr.message,
                data: null,
              });
            }

            docToUpd.filename = fileUplResp?.filename;

            const docResponse = await DocumentiDAO.updateDocumento(docToUpd);
            console.log(docResponse);

            const respErr = docResponse.error;
            if(respErr) {
                return res.status(400).json({
                    success: false,
                    msg: respErr.message,
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
            console.error(err);
            res.status(500).json({ 
                success: false,
                msg: err.message,
                data: null 
            });
        }
    }

    static async apiDeleteDocumenti(req, res) {
        const codice = req.query.codice.toUpperCase();
        if(!codice) {
            return res.status(400).json({
                success: false,
                msg: "Codice documento non specificato.",
                data: null
            });
        }
        
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

            docResponse.codice = codice;

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
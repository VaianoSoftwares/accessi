import BadgesDAO from "../dao/badges.dao.js";
import fileUpl from "./badges.fileupload.js";

export default class BadgesController {
    static async apiGetBadges(req, res) {
        let filters = [];
        Object.entries(req.query).forEach(
          item => filters.push({key: item[0], value: item[1]})
        );
        const tipoBadge = req.params.tipo || "tutti";

        let response;

        try {
            const badgesList = await BadgesDAO.getBadges(filters, tipoBadge);
            response = {
                success: true,
                data: badgesList,
                filters: filters
            }
            res.json(response);
        } catch(err) {
            console.log(`apiGetBadges - ${err}`);
            response = {
                success: false,
                data: [],
                filters: filters,
                error: err
            };
            res.status(500).json(response);
        }
    }

    static async apiPostBadges(req, res) {
        if(!req.body.barcode) {
            return res.status(400).json({ success: false, msg: "Barcode non inserito" });
        }

        try {
            const badgesResponse = await BadgesDAO.addBadge(req.body);

            const { error } = badgesResponse;
            if(error) {
                return res.status(400).json({ success: false, msg: error.message });
            }

            const fileUplResp = await fileUpl(req.files, req.body.barcode);
            if(fileUplResp.error) {
                return res.status(400).json({ success: false, msg: fileUplResp.error.message });
            }
            else if(fileUplResp.fileName) {
                const updPfpResp = await BadgesDAO.updateBadge({
                  barcode: req.body.barcode,
                  foto_profilo: fileUplResp.fileName,
                });
                if(updPfpResp.error) {
                    return res.status(400).json({ success: false, msg: updPfpResp.error.message });
                }
            }

            res.json({ success: true, msg: "Badge aggiunto con successo", data: badgesResponse });
        } catch(err) {
            console.log(err);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiPutBadges(req, res) {
        if(!req.body.barcode) {
            return res.status(400).json({ success: false, msg: "Barcode non inserito" });
        }

        try {
            const badgesResponse = await BadgesDAO.updateBadge(req.body);

            const { error } = badgesResponse;
            if(error) {
                return res.status(400).json({ success: false, msg: error.message });
            }

            if(badgesResponse.modifiedCount === 0) {
                throw new Error(
                    `Badge ${req.body.barcode} non aggiornato.`
                );
            }

            const fileUplResp = await fileUpl(req.files, req.body.barcode);
            if(fileUplResp.error) {
                return res.status(400).json({ success: false, msg: fileUplResp.error.message });
            }
            else if(fileUplResp.fileName) {
                const updPfpResp = await BadgesDAO.updateBadge({
                  barcode: req.body.barcode,
                  foto_profilo: fileUplResp.fileName,
                });
                if(updPfpResp.error) {
                    return res.status(400).json({ success: false, msg: updPfpResp.error.message });
                }
            }

            res.json({ success: true, msg: "Badge aggiornato con successo.", data: badgesResponse });
        } catch(err) {
            console.log(err);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiDeleteBadges(req, res) {
        const { barcode } = req.body;

        try {
            const badgesResponse = await BadgesDAO.deleteBadge(barcode);

            if(badgesResponse.deletedCount === 0) {
                throw new Error(`Badge ${barcode} non eliminato - Barcode non esistente`);
            }
            res.json({ success: true, msg: "Badge eliminato con successo.", data: badgesResponse });
        } catch(err) {
            console.log(`apiDeleteBadges - ${err}`);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiGetReparti(req, res) {
        try {
            const repartiList = await BadgesDAO.getReparti();
            res.json({ success: true, data: repartiList });
        } catch(err) {
            console.log(`apiGetReparti - ${err}`);
            res.status(500).json({ success: false, data: [], error: err });
        }
    }

    static async apiGetTipiDoc(req, res) {
        try {
            const tipiDocList = await BadgesDAO.getTipiDoc();
            res.json({ success: true, data: tipiDocList });
        } catch(err) {
            console.log(`apiGetTipiDoc - ${err}`);
            res.status(500).json({ success: false, data: [], error: err });
        }
    }
};
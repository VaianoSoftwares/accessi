import BadgesDAO from "../dao/badges.dao.js";
import fileUpl from "./badges.fileupload.js";
import EnumsDAO from "../dao/enums.dao.js";

export default class BadgesController {
    static async apiGetBadges(req, res) {
        let response;

        try {
            const badgesList = await BadgesDAO.getBadges(req.query);
            response = {
                success: true,
                data: badgesList,
                filters: req.query
            }
            res.json(response);
        } catch(err) {
            console.log(`apiGetBadges - ${err}`);
            response = {
                success: false,
                data: [],
                filters: req.query,
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
            else if(badgesResponse.modifiedCount === 0) {
                throw new Error(
                    `Badge ${req.body.barcode} non aggiornato. Nessun campo inserito.`
                );
            }

            res.json({ success: true, msg: "Badge aggiornato con successo.", data: badgesResponse });
        } catch(err) {
            console.log(err);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiDeleteBadges(req, res) {
        const { barcode } = req.query;

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

    static async apiGetEnums(req, res) {
        try {
            const enums = await EnumsDAO.getEnums();
            res.json({ success: true, data: enums });
        } catch(err) {
            console.log(`apiGetEnums - ${err}`);
            res.status(500).json({ success: false, data: {}, error: err });
        }
    }

    static async apiGetAssegnazioni(req, res) {
        try {
            const { tipo } = req.query;
            if(tipo) {
                const enumResp = await EnumsDAO.getEnums(`assegnazione.${tipo}`);
                res.json({ success: true, data: enumResp.assegnazione[tipo] });
            }
            else {
                const enumResp = await EnumsDAO.getEnums("assegnazione");
                const assegnazList = Object.values(enumResp.assegnazione).flat();
                res.json({ success: true, data: assegnazList });
            }
        } catch(err) {
            console.log(`apiGetReparti - ${err}`);
            res.status(500).json({ success: false, data: [], error: err });
        }
    }

    static async apiGetTipiDoc(req, res) {
        try {
            const enumResp = await EnumsDAO.getEnums("documento");
            res.json({ success: true, data: enumResp.documento });
        } catch(err) {
            console.log(`apiGetTipiDoc - ${err}`);
            res.status(500).json({ success: false, data: [], error: err });
        }
    }

    static async apiGetStati(req, res) {
        try {
            const enumResp = await EnumsDAO.getEnums("stato");
            res.json({ success: true, data: enumResp.stato });
        } catch(err) {
            console.log(`apiGetStati - ${err}`);
            res.status(500).json({ success: false, data: [], error: err });
        }
    }

    static async apiGetTipiBadge(req, res) {
        try {
            const enumResp = await EnumsDAO.getEnums("badge");
            res.json({ success: true, data: enumResp.badge });
        } catch(err) {
            console.log(`apiGetTipiBadge - ${err}`);
            res.status(500).json({ success: false, data: [], error: err });
        }
    }
};
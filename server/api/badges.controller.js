import BadgesDAO from "../dao/badges.dao.js";
import FileManager from "./badges.filemanager.js";
import EnumsDAO from "../dao/enums.dao.js";
import Validator from "../auth/validation.js";

export default class BadgesController {
    static async apiGetBadges(req, res) {
        let response;

        try {
            const badgesList = await BadgesDAO.getBadges(req.query);
            response = {
                success: true,
                data: badgesList,
                filters: req.query,
                msg: "Badge ottenuti con successo"
            }
            res.json(response);
        } catch(err) {
            console.log(`apiGetBadges - ${err}`);
            response = {
                success: false,
                data: [],
                filters: req.query,
                msg: err.msg
            };
            res.status(500).json(response);
        }
    }

    static async apiPostBadges(req, res) {
        const dataToVerify = {
            barcode: req.body.barcode,
        };
        const valErr = Validator.badgeDoc(dataToVerify).error;
        if(valErr) {
            return res.status(400).json({ success: false, msg: valErr.details[0].message, data: null });
        }

        try {
            const badgesResponse = await BadgesDAO.addBadge(req.body);

            const { error } = badgesResponse;
            if(error) {
                return res.status(400).json({ success: false, msg: error.message, data: null });
            }

            const fileUplResp = await FileManager.uploadPfp(
              req.files,
              req.body.barcode,
              req.body.tipo
            );
            if (fileUplResp.error) {
              return res
                .status(400)
                .json({ success: false, msg: fileUplResp.error.message, data: null });
            }/* else if (fileUplResp.fileName) {
              const updPfpResp = await BadgesDAO.updateBadge({
                barcode: req.body.barcode,
                pfp: fileUplResp.fileName,
              });
              if (updPfpResp.error) {
                return res
                  .status(400)
                  .json({ success: false, msg: updPfpResp.error.message });
              }
            }*/

            res.json({ success: true, msg: "Badge aggiunto con successo", data: badgesResponse });
        } catch(err) {
            console.log(err);
            res.status(500).json({ success: false, msg: err.message, data: null });
        }
    }

    static async apiPutBadges(req, res) {
        const valErr = Validator.badgeDoc(req.body).error;
        if(valErr) {
            return res.status(400).json({ success: false, msg: valErr.details[0].message, data: null });
        }

        try {
            const badgesResponse = await BadgesDAO.updateBadge(req.body);

            const { error } = badgesResponse;
            if(error) {
                return res.status(400).json({ success: false, msg: error.message, data: null });
            }

            const fileUplResp = await FileManager.uploadPfp(
              req.files,
              req.body.barcode,
              req.body.tipo
            );
            if (fileUplResp.error) {
              return res
                .status(400)
                .json({ success: false, msg: fileUplResp.error.message, data: null });
            }/* else if (fileUplResp.fileName) {
              const updPfpResp = await BadgesDAO.updateBadge({
                barcode: req.body.barcode,
                pfp: fileUplResp.fileName,
              });
              if (updPfpResp.error) {
                return res
                  .status(400)
                  .json({ success: false, msg: updPfpResp.error.message });
              }
            }*/
            else if (badgesResponse.modifiedCount === 0 && !fileUplResp.fileName) {
              throw new Error(
                `Badge ${req.body.barcode} non aggiornato. Nessun campo inserito.`
              );
            }

            res.json({ success: true, msg: "Badge aggiornato con successo.", data: badgesResponse });
        } catch(err) {
            console.log(err);
            res.status(500).json({ success: false, msg: err.message, data: null });
        }
    }

    static async apiDeleteBadges(req, res) {
        const { barcode } = req.query;

        try {
            const badgesResponse = await BadgesDAO.deleteBadge(barcode);

            if(badgesResponse.deletedCount === 0) {
                throw new Error(`Badge ${barcode} non eliminato - Barcode non esistente`);
            }

            const { error } = await FileManager.deletePfp(barcode);

            if(error) {
                throw new Error(`Badge ${barcode} - Non e' stato possibile eliminare pfp`);
            }

            res.json({ success: true, msg: "Badge eliminato con successo.", data: badgesResponse });
        } catch(err) {
            console.log(`apiDeleteBadges - ${err}`);
            res.status(500).json({ success: false, msg: err.message, data: null });
        }
    }

    static async apiGetEnums(req, res) {
        try {
            const enums = await EnumsDAO.getEnums();
            res.json({ success: true, data: enums, msg: "Enums ottenuti con successo" });
        } catch(err) {
            console.log(`apiGetEnums - ${err}`);
            res.status(500).json({ success: false, data: null, msg: err.msg });
        }
    }

    static async apiGetAssegnazioni(req, res) {
        try {
            const { tipo } = req.query;
            if(tipo) {
                const enumResp = await EnumsDAO.getEnums(`assegnazione.${tipo}`);
                res.json({ success: true, data: enumResp.assegnazione[tipo], msg: "Assegnazioni ottenute con successo" });
            }
            else {
                const enumResp = await EnumsDAO.getEnums("assegnazione");
                /*const assegnazList = Object.values(enumResp.assegnazione).flat()*/;
                res.json({ success: true, data: /*assegnazList*/enumResp, msg: "Assegnazioni ottenute con successo" });
            }
        } catch(err) {
            console.log(`apiGetAssegnazioni - ${err}`);
            res.status(500).json({ success: false, data: {}, msg: String(err) });
        }
    }

    static async apiPostAssegnazioni(req, res) {
        try {
            const { error } = Validator.enumDoc(req.body);
            if(error) {
                return res.status(400).json({ success: false, msg: error.details[0].message });
            }

            const assegnazObj = {
                badge: req.body.badge.toUpperCase(),
                name: req.body.name.toUpperCase()
            };
            
            const enumResp = await EnumsDAO.pushAssegnaz([assegnazObj]);
            if(enumResp.error) {
                return res.status(400).json({ success: false, msg: error.message });
            }
            else if(enumResp.modifiedCount === 0) {
                throw new Error(
                  `Non ?? stato possibile inserire ${assegnazObj.name} in ${assegnazObj.badge}`
                );
            }
            return res.json({
              success: true,
              msg: `Assegnazione di tipo ${assegnazObj.badge} inserita con successo`,
              data: enumResp,
            });
        } catch(err) {
            console.log(`apiPostAssegnazioni - ${err}`);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiDeleteAssegnazioni(req, res) {
        try {
            const { error } = Validator.enumDoc(req.query);
            if(error) {
                return res.status(400).json({ success: false, msg: error.details[0].message });
            }

            const assegnazObj = {
                badge: req.query.badge.toUpperCase(),
                name: req.query.name.toUpperCase()
            };

            const enumResp = await EnumsDAO.pullAssegnaz([assegnazObj]);
            if(enumResp.error) {
                return res.status(400).json({ success: false, msg: error.message });
            }
            else if(enumResp.deletedCount === 0) {
                throw new Error(
                  `Non ?? stato possibile eliminare ${assegnazObj.name} in ${assegnazObj.badge}`
                );
            }
            return res.json({
              success: true,
              msg: `Assegnazione di tipo ${assegnazObj.badge} eliminata con successo`,
              data: enumResp,
            });
        } catch(err) {
            console.log(`apiDeleteAssegnazioni - ${err}`);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiGetTipiDoc(req, res) {
        try {
            const enumResp = await EnumsDAO.getEnums("documento");
            res.json({ success: true, data: enumResp.documento });
        } catch(err) {
            console.log(`apiGetTipiDoc - ${err}`);
            res.status(500).json({ success: false, data: [], msg: err.message });
        }
    }

    static async apiGetStati(req, res) {
        try {
            const enumResp = await EnumsDAO.getEnums("stato");
            res.json({ success: true, data: enumResp.stato });
        } catch(err) {
            console.log(`apiGetStati - ${err}`);
            res.status(500).json({ success: false, data: [], msg: err.message });
        }
    }

    static async apiGetTipiBadge(req, res) {
        try {
            const enumResp = await EnumsDAO.getEnums("badge");
            res.json({ success: true, data: enumResp.badge });
        } catch(err) {
            console.log(`apiGetTipiBadge - ${err}`);
            res.status(500).json({ success: false, data: [], msg: err.message });
        }
    }
};
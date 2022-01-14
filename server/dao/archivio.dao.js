import BadgesDAO from "./badges.dao.js";
import { ObjectId } from "mongodb";

let archivio;

export default class ArchivioDAO {
    static async injectDB(conn) {
        if(archivio) {
            return;
        }

        try {
            archivio = await conn.db(process.env.DB_NAME).collection("archivio");
        } catch(err) {
            console.log(`Failed to inject DB. ${err}`);
        }
    }

    static async getArchivio(inizio = "", fine = "") {
        const dateFilter = [{ "data.uscita": { $ne: null } }];
        if(inizio && fine)
            dateFilter.push({ "data.entrata": { $gte: new Date(inizio), $lt: new Date(fine) } });
        
        const query = { $and: dateFilter };

        try {
            const cursor = await archivio.find(query);
            const archivioList = await cursor.toArray();
            return archivioList;
        } catch(err) {
            console.log(`getArchivio - ${err}`);
            return [];
        }
    }

    static async getInStruttBy(key, value) {
        try {
            let filter = {};
            filter[key] = key === "_id" ? { $eq: new ObjectId(value) } : { $eq: value };

            const response = await archivio.findOne(
                { $and: [ filter, { "data.uscita": { $eq: null } } ] }
            );
            return response;
        } catch(err) {
            console.log(`getInStruttBy - ${err}`);
        }
    }

    static async getArchivioById(id) {
        try {
            const response = await archivio.findOne(
                { $and: [ { _id: { $eq: id } }, { "data.uscita": { $ne: null } } ] }
            );
            return response;
        } catch(err) {
            console.log(`getArchivioById - ${err}`);
        }
    }

    static async timbra(barcode, tipo, postazione, nominativo) {
        let timbraResp = { 
          barcode: barcode, 
          tipo: tipo,
          assegnazione: undefined,
          postazione: postazione,
          nominativo: nominativo, 
          data: {
            entrata: undefined
          }
        };

        const isUni = barcode && barcode.length === 7 && /^\d+$/.test(barcode);

        try {
          if(isUni) {
            timbraResp.tipo = "badge";
            timbraResp.assegnazione = "utente";
            timbraResp.nominativo = {
              tdoc: "tessera studente",
              ndoc: barcode
            }
          }
          else {
            const badgesArr = await BadgesDAO.getBadges({ barcode: barcode });
            if (badgesArr.length === 0) {
              throw new Error(`Badge ${barcode} invalido: non esistente`);
            }
            else if(badgesArr[0].stato !== "valido") {
              throw new Error(`Badge ${barcode} non valido: ${badgesArr[0].stato}`);
            }
            else if(new Date() >= badgesArr[0].scadenza) {
              throw new Error(`Badge ${barcode} non valido: scaduto`);
            }
            timbraResp.tipo = badgesArr[0].tipo;
            timbraResp.assegnazione = badgesArr[0].assegnazione;
            if(badgesArr[0].nominativo) {
              timbraResp.nominativo = badgesArr[0].nominativo;
            }
          }

          let inStrutt = await this.getInStruttBy("barcode", barcode);
          if (inStrutt) {
            const id = inStrutt._id;
            const { modifiedCount } = await this.#timbraEsce(id);

            if (modifiedCount === 0) {
              throw new Error(
                `Non è stato possibile timbrare badge ${barcode}.`
              );
            }

            const archResp = await this.getArchivioById(id);
            timbraResp.data.entrata = archResp.data.entrata;
            return { response: timbraResp, msg: "Timbra Esce" };
          } else {
            const { error, insertedId } = await this.#timbraEntra(
              barcode, postazione, timbraResp.nominativo
            );

            if (error) {
              throw new Error(error);
            }

            inStrutt = await this.getInStruttBy("_id", insertedId);
            timbraResp.data.entrata = inStrutt.data.entrata;
            return { response: timbraResp, msg: "Timbra Entra" };
          }
        } catch (err) {
          console.log(`timbra - ${err}`);
          return { error: err };
        }
    }

    static async #timbraEntra(barcode, postazione, nominativo) {
        try {
            let archivioDoc = {
                barcode: barcode,
                data: {
                    entrata: new Date(),
                    uscita: null
                },
                postazione: postazione,
                nominativo: nominativo
            };

            const response = await archivio.insertOne(archivioDoc);
            return response;
        } catch (err) {
            console.log(`timbra entra - ${err}`);
            return { error: err };
        }
    }

    static async #timbraEsce(id) {
        try {
            const response = await archivio.updateOne(
                { "_id": id },
                { $set: { "data.uscita": new Date() } }
            );
            return response;
        } catch(err) {
            console.log(`timbra esce - ${err}`);
            return { error: err };
        }
    }

    static async getInStrutt(tipoBadge = "") {
        try {
            //const tipoExpr = tipoBadge ? { $eq: ["$tipo", tipoBadge] } : {};
            const tipoExpr = tipoBadge ? { "tipo": { $eq: tipoBadge } } : {};
            const cursor = await archivio.aggregate([
              {
                $lookup: {
                  from: "badges",
                  let: { arch_codice: "$barcode" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$barcode", "$$arch_codice"] },
                            {}//tipoExpr
                          ],
                        },
                      },
                    },
                    { $project: { "_id": 0, "descrizione": 1, "tipo": 1, "assegnazione": 1, "stato": 1, "ubicazione": 1 } }
                  ],
                  as: "badge",
                },
              },
              { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$badge", 0] }, "$$ROOT"] } } },
              { $match: { $and: [{ "data.uscita": { $eq: null } }, tipoExpr] } },
              { $project: { "data.uscita": 0, "badge": 0 } },
              { $limit: 100 },
            ]);
            const displayCursor = cursor.limit(100).skip(0);
            const inStruttList = await displayCursor.toArray();
            return inStruttList;
        } catch(err) {
            console.log(`getInStrutt - ${err}`);
            return [];
        }
    }
};
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

    static async timbra(barcode, nominativo) {
        try {
          let inStrutt = await this.getInStruttBy("barcode", barcode);
          if (inStrutt) {
            const id = inStrutt._id;
            const timbraResp = await this.#timbraEsce(id);

            if (timbraResp.modifiedCount === 0) {
              throw new Error(
                `Non è stato possibile timbrare badge ${barcode}`
              );
            }

            console.log(`timbra esce - ${inStrutt}`);
            const archResp = await this.getArchivioById(id);
            return { response: archResp, msg: "Timbra Esce" };
          } else {
            const isUni =
              barcode && barcode.length === 7 && /^\d+$/.test(barcode);
            if (isUni) {
              nominativo.tipo_doc = "tessera studente";
              nominativo.cod_doc = barcode;
            }

            const timbraResp = await this.#timbraEntra(barcode, nominativo, isUni);
            inStrutt = await this.getInStruttBy("_id", timbraResp.insertedId);
            return { response: inStrutt, msg: "Timbra Entra" };
          }
        } catch (err) {
          console.log(`timbra - ${err}`);
          return { error: err };
        }
    }

    static async #timbraEntra(barcode, nominativo, isUni) {
        try {
            let archivioDoc = {
                barcode: barcode,
                data: {
                    entrata: new Date(),
                    uscita: null
                },
                nominativo: {
                    nome: nominativo.nome,
                    cognome: nominativo.cognome,
                    rag_soc: nominativo.rag_soc,
                    num_tel: nominativo.num_tel,
                    documento: {
                        tipo: nominativo.tipo_doc,
                        codice: nominativo.cod_doc
                    }
                }
            };
            
            if (!isUni) {
              const badge = await BadgesDAO.findBadgeByBarcode(barcode);
              if (!badge) {
                throw new Error(`Badge ${barcode} invalido: non esistente`);
              } else if (badge.chiave) {
                throw new Error(`Badge ${barcode} invalido: chiave`);
              } else if (badge.nominativo) {
                archivioDoc.nominativo = badge.nominativo;
              }
            }

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

    static async getInStrutt() {
        try {
            const cursor = await archivio.find({ "data.uscita": null });
            const inStruttList = await cursor.toArray();
            return inStruttList;
        } catch(err) {
            console.log(`getInStrutt - ${err}`);
            return [];
        }
    }
};
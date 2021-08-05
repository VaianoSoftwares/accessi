import BadgesDAO from "./badges.dao.js";

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

    static async getArchivio(entrata = "", uscita = "") {
        const dateFilter = [{ "data.uscita": { $ne: null } }];
        if(entrata)
            dateFilter.push({ "data.entrata": { $gte: new Date(entrata) } });
        if(uscita)
            dateFilter.push({ "data.uscita": { $lte: new Date(uscita) } });
        
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

    static async getInStruttByBarcode(barcode) {
        try {
            const response = await archivio.findOne(
                { $and: [ { "barcode": { $eq: barcode } }, { "data.uscita": { $eq: null } } ] }
            );
            return response;
        } catch(err) {
            console.log(`getInStruttByBarcode - ${err}`);
        }
    }

    static async timbra(barcode, nominativo) {
        try {
          const inStrutt = await this.getInStruttByBarcode(barcode);
          if (inStrutt) {
            const id = inStrutt._id;
            const response = await this.#timbraEsce(id);

            if (response.modifiedCount === 0) {
              throw new Error(
                `Non è stato possibile timbrare badge ${barcode}`
              );
            }

            return { response: response, msg: "Timbra Esce" };
          } else {
            const isUni =
              barcode && barcode.length === 7 && /^\d+$/.test(barcode);
            if (isUni) {
              nominativo.tipoDoc = "tessera studente";
              nominativo.codDoc = barcode;
            }

            const response = await this.#timbraEntra(barcode, nominativo, isUni);
            return { response: response, msg: "Timbra Entra" };
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
                    rag_soc: nominativo.ragSoc,
                    num_tel: nominativo.numTel,
                    documento: {
                        tipo: nominativo.tipoDoc,
                        codice: nominativo.codDoc
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
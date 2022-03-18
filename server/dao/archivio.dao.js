import BadgesDAO from "./badges.dao.js";
import { ObjectId } from "mongodb";

let archivio;

export default class ArchivioDAO {
  static async injectDB(conn) {
    if (archivio) {
      return;
    }

    try {
      archivio = await conn.db(process.env.DB_NAME).collection("archivio");
    } catch (err) {
      console.log(`Failed to inject DB. ${err}`);
    }
  }

  static async getArchivio(inizio = "", fine = "") {
    const dateFilter = [{ "data.uscita": { $ne: null } }];
    if (inizio && fine)
      dateFilter.push({ "data.entrata": { $gte: new Date(inizio), $lt: new Date(fine) } });

    const query = { $and: dateFilter };

    try {
      const cursor = await archivio.find(query);
      const archivioList = await cursor.toArray();
      return archivioList;
    } catch (err) {
      console.log(`getArchivio - ${err}`);
      return [];
    }
  }

  static async getInStruttBy(key, value) {
    try {
      let filter = {};
      filter[key] = key === "_id" ? { $eq: new ObjectId(value) } : { $eq: value };

      const response = await archivio.findOne(
        { $and: [filter, { "data.uscita": { $eq: null } }] }
      );
      return response;
    } catch (err) {
      console.log(`getInStruttBy - ${err}`);
    }
  }

  static async getArchivioById(id) {
    try {
      const response = await archivio.findOne(
        { $and: [{ _id: { $eq: id } }, { "data.uscita": { $ne: null } }] }
      );
      return response;
    } catch (err) {
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
    let timbratura = { error: null };

    try {
      if (isUni) {
        timbraResp.tipo = "badge";
        timbraResp.assegnazione = "utente";
        timbraResp.nominativo = {
          tdoc: "tessera studente",
          ndoc: barcode
        }

        timbratura = await this.#timbraUnilaterale(
          barcode, postazione, timbraResp.nominativo
        );
      }
      else {
        const baseBarcode = barcode.slice(0, barcode.length - 1);
        const lastCh = barcode.charAt(barcode.length - 1);
        if (!"01".includes(lastCh)) {
          throw new Error("Codice invalido");
        }

        const [fetchedBadge] = await BadgesDAO.getBadges({ barcode: baseBarcode });
        if (!fetchedBadge) {
          throw new Error(`Badge ${barcode} invalido: non esistente`);
        }
        else if (fetchedBadge.stato !== "valido") {
          throw new Error(`Badge ${barcode} non valido: ${fetchedBadge.stato}`);
        }
        else if (fetchedBadge.scadenza && new Date() >= fetchedBadge.scadenza) {
          throw new Error(`Badge ${barcode} non valido: scaduto`);
        }
        timbraResp.barcode = baseBarcode;
        timbraResp.tipo = fetchedBadge.tipo;
        timbraResp.assegnazione = fetchedBadge.assegnazione;
        if (fetchedBadge.nominativo !== null) {
          timbraResp.nominativo = fetchedBadge.nominativo;
        }

        const fronteRetro = Number(lastCh);
        if (!fronteRetro) {
          if (!timbraResp.nominativo.tdoc) {
            throw new Error(
              `Impossibile timbrare ${baseBarcode}: tipo documento non specificato.`
            );
          }
          else if (!timbraResp.nominativo.ndoc) {
            throw new Error(
              `Impossibile timbrare ${baseBarcode}: codice documento non specificato.`
            );
          }
        }

        timbratura = await this.#timbraFronteRetro(
          baseBarcode, fronteRetro, postazione, timbraResp.nominativo
        );
      }

      if (timbratura.error) {
        throw new Error(timbratura.error);
      }

      timbraResp.data.entrata = timbratura.dataEntra;

      console.log(timbraResp);

      return { response: timbraResp, msg: timbratura.msg };
    } catch (err) {
      console.log(`timbra - ${err}`);
      return { error: err };
    }
  }

  static async #timbraFronteRetro(barcode, fronteRetro, postazione, nominativo) {
    try {
      const inStrutt = await this.getInStruttBy("barcode", barcode);

      if (!inStrutt && !fronteRetro) {
        const { error, insertedId } = await this.#timbraEntra(
          barcode, postazione, nominativo
        );

        if (error) {
          throw new Error(error);
        }

        const { data } = await this.getInStruttBy("_id", insertedId);

        return {
          msg: "Timbra Entra",
          dataEntra: data.entrata,
          error: null
        };
      }
      else if (inStrutt && fronteRetro) {
        const id = inStrutt._id;
        const { modifiedCount } = await this.#timbraEsce(id);

        if (modifiedCount === 0) {
          throw new Error(
            `Non è stato possibile timbrare badge ${barcode}.`
          );
        }

        return {
          msg: "Timbra Esce",
          dataEntra: inStrutt.data.entrata,
          error: null
        };
      }
      else {
        let msg;
        if (!inStrutt && fronteRetro) {
          msg = "Impossibile timbrare uscita: codice non in struttura";
        }
        else if (inStrutt && !fronteRetro) {
          msg = "Impossibile timbrare entrata: codice gia\' in struttura";
        }
        throw new Error(msg);
      }
    } catch (err) {
      console.log("timbraFronteRetro - ", err);
      return { error: err };
    }
  }

  static async #timbraUnilaterale(barcode, postazione, nominativo) {
    try {
      const inStrutt = await this.getInStruttBy("barcode", barcode);
      if (inStrutt) {
        const id = inStrutt._id;
        const { modifiedCount } = await this.#timbraEsce(id);

        if (modifiedCount === 0) {
          throw new Error(
            `Non è stato possibile timbrare badge ${barcode}.`
          );
        }

        return {
          msg: "Timbra Esce",
          dataEntra: inStrutt.data.entrata,
          error: null
        };
      } else {
        const { error, insertedId } = await this.#timbraEntra(
          barcode, postazione, nominativo
        );

        if (error) {
          throw new Error(error);
        }

        const { data } = await this.getInStruttBy("_id", insertedId);
        return {
          msg: "Timbra Entra",
          dataEntra: data.entrata,
          error: null
        };
      }
    } catch (err) {
      console.log("timbraUnilaterale - ", err);
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
    } catch (err) {
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
    } catch (err) {
      console.log(`getInStrutt - ${err}`);
      return [];
    }
  }
};
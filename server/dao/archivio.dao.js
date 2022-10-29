import BadgesDAO from "./badges.dao.js";
import { ObjectId } from "mongodb";

let archivio;

export default class ArchivioDAO {
  static async injectDB(conn) {
    if (archivio) return;

    try {
      archivio = await conn.db(process.env.DB_NAME).collection("archivio1");
    } catch (err) {
      console.log(`Failed to inject DB. ${err}`);
    }
  }

  static async getArchivio(filters = {}) {
    const archivioFilter = [{ "data.uscita": { $ne: null } }];
    if (filters.dataInizio && filters.dataFine) {
      const dateFilter = {
        "data.entrata": {
          $gte: new Date(new Date(filters.dataInizio).toISOString()),
          $lte: new Date(new Date(filters.dataFine).toISOString()),
        },
      };
      archivioFilter.push(dateFilter);
    }
    Object.entries(filters)
      .filter(([key, value]) => value && !key.includes("data"))
      .forEach(([key, value]) => {
        let isKeyValid = true;
        let filterName = "";

        switch(key) {
          case "barcode":
          case "descrizione":
          case "tipo":
          case "stato":
          case "assegnazione":
          case "ubicazione":
            filterName = `badge.${key}`;
            break;
          case "nome":
          case "cognome":
          case "ditta":
          case "telefono":
          case "tdoc":
          case "ndoc":
            filterName = `badge.nominativo.${key}`;
            break;
          default:
            isKeyValid = false;
        }

        if(isKeyValid === true) {
          let filter = {};
          filter[filterName] = { $regex: new RegExp(value, "i") };
          archivioFilter.push(filter);
        }
      });
    const query = { $and: archivioFilter };
    console.log("getArchivio | query: ", query);
    try {
      const cursor = await archivio.find(query);
      // const cursor = await archivio.aggregate([
      //   {
      //     $lookup: {
      //       from: "badges",
      //       let: { arch_codice: "$barcode" },
      //       pipeline: [
      //         {
      //           $match: {
      //             $expr: {
      //               $eq: ["$barcode", "$$arch_codice"]
      //             },
      //           },
      //         },
      //         { $project: { "_id": 0, "descrizione": 1, "tipo": 1, "assegnazione": 1, "stato": 1, "ubicazione": 1 } }
      //       ],
      //       as: "badge",
      //     },
      //   },
      //   { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$badge", 0] }, "$$ROOT"] } } },
      //   { $match: query },
      //   { $project: { "_id": 0, "badge": 0 } },
      //   { $limit: 500 },
      // ]);
      const displayCursor = cursor.limit(500).skip(0);
      const archivioList = await displayCursor.toArray();
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

  static async timbra(badgeDoc, cliente, postazione, ip) {
    // this will the response, a "timbra" document
    let timbraResp = {
      badge: badgeDoc,
      cliente,
      postazione,
      ip,
      data: {
        entrata: undefined
      },
    }

    // check if barcode is a "tessera universitario" document number
    const isUni = badgeDoc.barcode?.length === 7 && /^\d+$/.test(badgeDoc.barcode);
    let timbratura = { error: null };

    try {
      // if isUni then create a new badge provvisorio
      if(isUni) {
        const uniDoc = {
          barcode: badgeDoc.barcode,
          descrizione: "UNIVERSITARIO",
          tipo: "BADGE",
          assegnazione: "UNIVERSITARIO",
          stato: "VALIDO",
          ubicazione: "",
          nominativo: {
            tdoc: "TESSERA STUDENTE",
            ndoc: badgeDoc.barcode
          }
        };
        timbraResp.badge = uniDoc;
      }
      // or else search for an existing badge in order to gather nominativo's data
      else {
        const [fetchedBadge] = await BadgesDAO.getBadges({ barcode: badgeDoc.barcode });
        if (!fetchedBadge) {
          throw new Error(`Badge ${badgeDoc.barcode} non valido: non esistente`);
        }
        else if (fetchedBadge.stato?.toUpperCase() !== "VALIDO") {
          throw new Error(`Badge ${badgeDoc.barcode} non valido: ${fetchedBadge.stato}`);
        }
        else if (fetchedBadge.scadenza && new Date() >= fetchedBadge.scadenza) {
          throw new Error(`Badge ${badgeDoc.barcode} non valido: scaduto`);
        }
        timbraResp.badge = fetchedBadge;
      }

      timbratura = await this.#timbraUnilaterale(
        timbraResp.badge, cliente, postazione, ip
      );

      if (timbratura.error) throw new Error(timbratura.error);

      timbraResp.data.entrata = timbratura.dataEntra;

      console.log(timbraResp);

      return { response: timbraResp, msg: timbratura.msg };
    } catch(err) {
      console.log(`timbra - ${err}`);
      return { error: err };
    }
  }

  // static async timbra(barcode, tipo, cliente, postazione, nominativo) {
  //   let timbraResp = {
  //     barcode,
  //     tipo,
  //     assegnazione: undefined,
  //     cliente,
  //     postazione,
  //     nominativo,
  //     data: {
  //       entrata: undefined
  //     }
  //   };

  //   const isUni = barcode?.length === 7 && /^\d+$/.test(barcode);
  //   let timbratura = { error: null };

  //   try {
  //     if (isUni) {
  //       timbraResp.tipo = "BADGE";
  //       timbraResp.assegnazione = "UTENTE";
  //       timbraResp.nominativo = {
  //         tdoc: "TESSERA STUDENTE",
  //         ndoc: barcode
  //       };

  //       timbratura = await this.#timbraUnilaterale(
  //         barcode, cliente, postazione, timbraResp.nominativo
  //       );
  //     }
  //     else {
  //       const baseBarcode = barcode.slice(0, barcode.length - 1);
  //       const lastCh = barcode.charAt(barcode.length - 1);
  //       if (!"01".includes(lastCh)) {
  //         throw new Error(`Badge ${barcode} non valido: codice privo di flag fronte/retro`);
  //       }

  //       const [fetchedBadge] = await BadgesDAO.getBadges({ barcode: baseBarcode });
  //       if (!fetchedBadge) {
  //         throw new Error(`Badge ${barcode} non valido: non esistente`);
  //       }
  //       else if (fetchedBadge.stato !== "VALIDO") {
  //         throw new Error(`Badge ${barcode} non valido: ${fetchedBadge.stato}`);
  //       }
  //       else if (fetchedBadge.scadenza && new Date() >= fetchedBadge.scadenza) {
  //         throw new Error(`Badge ${barcode} non valido: scaduto`);
  //       }
  //       timbraResp.barcode = baseBarcode;
  //       timbraResp.tipo = fetchedBadge.tipo;
  //       timbraResp.assegnazione = fetchedBadge.assegnazione;
  //       if (fetchedBadge.nominativo !== null) {
  //         timbraResp.nominativo = fetchedBadge.nominativo;
  //       }

  //       const fronteRetro = Number(lastCh);
  //       if (!fronteRetro) {
  //         if (!timbraResp.nominativo.tdoc) {
  //           throw new Error(
  //             `Impossibile timbrare ${baseBarcode}: tipo documento non specificato.`
  //           );
  //         }
  //         else if (!timbraResp.nominativo.ndoc) {
  //           throw new Error(
  //             `Impossibile timbrare ${baseBarcode}: codice documento non specificato.`
  //           );
  //         }
  //       }

  //       timbratura = await this.#timbraFronteRetro(
  //         baseBarcode, fronteRetro, cliente, postazione, timbraResp.nominativo
  //       );
  //     }

  //     if (timbratura.error) throw new Error(timbratura.error);

  //     timbraResp.data.entrata = timbratura.dataEntra;

  //     console.log(timbraResp);

  //     return { response: timbraResp, msg: timbratura.msg };
  //   } catch (err) {
  //     console.log(`timbra - ${err}`);
  //     return { error: err };
  //   }
  // }

  // static async #timbraFronteRetro(barcode, fronteRetro, cliente, postazione, ip, nominativo) {
  //   try {
  //     const inStrutt = await this.getInStruttBy("barcode", barcode);

  //     if (!inStrutt && !fronteRetro) {
  //       const { error, insertedId } = await this.#timbraEntra(
  //         barcode, cliente, postazione, ip, nominativo
  //       );

  //       if (error) {
  //         throw new Error(error);
  //       }

  //       const { data } = await this.getInStruttBy("_id", insertedId);

  //       return {
  //         msg: "Timbra Entra",
  //         dataEntra: data.entrata,
  //         error: null
  //       };
  //     }
  //     else if (inStrutt && fronteRetro) {
  //       const id = inStrutt._id;
  //       const { modifiedCount } = await this.#timbraEsce(id);

  //       if (modifiedCount === 0) {
  //         throw new Error(
  //           `Non è stato possibile timbrare badge ${barcode}.`
  //         );
  //       }

  //       return {
  //         msg: "Timbra Esce",
  //         dataEntra: inStrutt.data.entrata,
  //         error: null
  //       };
  //     }
  //     else {
  //       let msg;
  //       if (!inStrutt && fronteRetro) {
  //         msg = "Impossibile timbrare uscita: codice non in struttura";
  //       }
  //       else if (inStrutt && !fronteRetro) {
  //         msg = "Impossibile timbrare entrata: codice gia\' in struttura";
  //       }
  //       throw new Error(msg);
  //     }
  //   } catch (err) {
  //     console.log("timbraFronteRetro - ", err);
  //     return { error: err };
  //   }
  // }

  static async #timbraUnilaterale(badgeDoc, cliente, postazione, ip) {
    try {
      const inStrutt = await this.getInStruttBy("badge.barcode", badgeDoc.barcode);
      // badge è in struttura, verrà timbrata la sua uscita
      if (inStrutt) {
        const id = inStrutt._id;
        // aggiornamento oggetto archivio: viene settata data di uscita del badge nell'archivio
        const { modifiedCount } = await this.#timbraEsce(id);

        if (modifiedCount === 0)
          throw new Error(`Non è stato possibile timbrare badge ${badgeDoc.barcode}.`);

        return {
          msg: "Timbra Esce",
          dataEntra: inStrutt.data.entrata,
          error: null
        };
      // badge NON è in struttura, verrà timbrata la sua entrata
      } else {
        // creazione nuovo oggetto archivio
        const { error, insertedId } = await this.#timbraEntra(
          badgeDoc, cliente, postazione, ip
        );

        if (error) throw new Error(error);
        
        // viene prelevata la data di entrata di timbratura del badge
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

  static async #timbraEntra(badgeDoc, cliente, postazione, ip) {
    try {
      let archivioDoc = {
        badge: badgeDoc,
        data: {
          entrata: new Date(new Date().toISOString()),
          uscita: null,
        },
        cliente,
        postazione,
        ip,
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
        { _id: id },
        {
          $set: {
            "data.uscita": new Date(new Date().toISOString()),
          },
        }
      );
      return response;
    } catch (err) {
      console.log(`timbra esce - ${err}`);
      return { error: err };
    }
  }

  static async getInStrutt(tipoBadge = "") {
    const query = tipoBadge
      ? {
          $and: [
            { "data.uscita": { $eq: null } },
            { "badge.tipo": { $regex: new RegExp(tipoBadge, "i") } },
          ],
        }
      : null;

    try {
      const cursor = await archivio.find(query);
      const displayCursor = cursor.limit(500).skip(0);
      const archivioList = await displayCursor.toArray();
      return archivioList;
    } catch(err) {
      console.log(`getInStrutt - ${err}`);
      return [];
    }
  }

  // static async getInStrutt(tipoBadge = "") {
  //   try {
  //     const tipoExpr = tipoBadge ? { "tipo": { $regex: new RegExp(tipoBadge, "i") } } : {};
  //     const cursor = await archivio.aggregate([
  //       {
  //         $lookup: {
  //           from: "badges",
  //           let: { arch_codice: "$barcode" },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ["$barcode", "$$arch_codice"] },
  //                     {}//tipoExpr
  //                   ],
  //                 },
  //               },
  //             },
  //             { $project: { "_id": 0, "descrizione": 1, "tipo": 1, "assegnazione": 1, "stato": 1, "ubicazione": 1 } }
  //           ],
  //           as: "badge",
  //         },
  //       },
  //       { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$badge", 0] }, "$$ROOT"] } } },
  //       { $match: { $and: [{ "data.uscita": { $eq: null } }, tipoExpr] } },
  //       { $project: { "data.uscita": 0, "badge": 0 } },
  //       { $limit: 500 },
  //     ]);
  //     const displayCursor = cursor.limit(500).skip(0);
  //     const inStruttList = await displayCursor.toArray();
  //     return inStruttList;
  //   } catch (err) {
  //     console.log(`getInStrutt - ${err}`);
  //     return [];
  //   }
  // }
};
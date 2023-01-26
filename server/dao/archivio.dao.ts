import BadgesDAO from "./badges.dao.js";
import { MongoClient, ObjectId, Collection, Filter } from "mongodb";
import errCheck from "../utils/errCheck.js";
import { TGenericBadge, TGenericNom } from "../types/badges.js";
import { TArchivio } from "../types/archivio.js";

const COLLECTION_NAME = "archivio1";

let archivio: Collection<TArchivio>;

export default class ArchivioDAO {
  static async injectDB(conn: MongoClient) {
    if (archivio) return;

    try {
      archivio = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
    } catch (err) {
      errCheck(err, `Failed to inject DB ${COLLECTION_NAME}.`);
    }
  }

  static async getArchivio(filters: Record<string, unknown> = {}) {
    const archivioFilter: Record<string, unknown>[] = [{ "data.uscita": { $ne: null } }];

    if (filters.dataInizio && filters.dataFine) {
      const dateFilter = {
        "data.entrata": {
          $gte: new Date(new Date(filters.dataInizio as string).toISOString()),
          $lte: new Date(new Date(filters.dataFine as string).toISOString()),
        },
      };
      archivioFilter.push(dateFilter);
    }

    Object.entries(filters)
      .filter(([key, value]) => value && !key.includes("data"))
      .forEach(([key, value]) => {
        let filterName = "";

        switch(key) {
          case "nominativo":
            filterName = "badge.barcode";
            break;
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
            return;
        }

        const filter: Record<string, unknown> = {};
        filter[filterName] = { $regex: new RegExp(value as string, "i") };
        archivioFilter.push(filter);
      });

    const query = { $and: archivioFilter };
    // console.log("getArchivio | query: ", query);

    try {
      const cursor = archivio.find(query, {
        projection: {
          _id: 0,
          codice: "$badge.barcode",
          tipo: "$badge.tipo",
          cliente: 1,
          postazione: 1,
          ip: 1,
          assegnaz: "$badge.assegnazione",
          nome: { $ifNull: ["$badge.nominativo.nome", ""] },
          cognome: { $ifNull: ["$badge.nominativo.cognome", ""] },
          ditta: { $ifNull: ["$badge.nominativo.ditta", ""] },
          entrata: "$data.entrata",
          uscita: "$data.uscita",
        },
      });
      const displayCursor = cursor.limit(500).skip(0);
      const archivioList = await displayCursor.toArray();
      return archivioList;
    } catch (err) {
      errCheck(err, "getArchivio |");
      return [];
    }
  }

  static async #getTimbraResponse(id: ObjectId, msg: string) {
    try {
      return await archivio.findOne(
        {
          _id: id,
        },
        {
          projection: {
            _id: 0,
            timbra: {
              codice: "$badge.barcode",
              tipo: "$badge.tipo",
              cliente: 1,
              postazione: 1,
              assegnaz: "$badge.assegnazione",
              nome: { $ifNull: ["$badge.nominativo.nome", ""] },
              cognome: { $ifNull: ["$badge.nominativo.cognome", ""] },
              ditta: { $ifNull: ["$badge.nominativo.ditta", ""] },
              entrata: "$data.entrata",
            },
            badge: {
              barcode: "$badge.barcode",
              descrizione: { $ifNull: ["$badge.descrizione", ""] },
              tipo: "$badge.tipo",
              assegnazione: "$badge.assegnazione",
              ubicazione: { $ifNull: ["$badge.ubicazione", ""] },
              stato: "$badge.stato",
              nome: { $ifNull: ["$badge.nominativo.nome", ""] },
              cognome: { $ifNull: ["$badge.nominativo.cognome", ""] },
              ditta: { $ifNull: ["$badge.nominativo.ditta", ""] },
              telefono: { $ifNull: ["$badge.nominativo.telefono", ""] },
              ndoc: { $ifNull: ["$badge.nominativo.ndoc", ""] },
              tdoc: { $ifNull: ["$badge.nominativo.tdoc", ""] },
              scadenza: { $ifNull: ["$badge.nominativo.scadenza", ""] },
              targa1: { $ifNull: ["$badge.nominativo.targhe.1", ""] },
              targa2: { $ifNull: ["$badge.nominativo.targhe.2", ""] },
              targa3: { $ifNull: ["$badge.nominativo.targhe.3", ""] },
              targa4: { $ifNull: ["$badge.nominativo.targhe.4", ""] },
            },
            msg
          },
        }
      );
    } catch (err) {
      errCheck(err, "getTimbraResponse |");
      return null;
    }
  }

  static async timbra(barcode: string, cliente: string, postazione: string, ip: string) {
    // check if barcode is a "tessera universitario" document number
    const isUni = barcode.length === 7 && /^\d+$/.test(barcode);

    let badgeTimbra: TGenericBadge;

    try {
      // if isUni then create a new badge provvisorio
      if (isUni) {
        const uniDoc: TGenericBadge = {
          barcode,
          descrizione: "UNIVERSITARIO",
          tipo: "PROVVISORIO",
          assegnazione: "UNIVERSITARIO",
          stato: "VALIDO",
          ubicazione: "",
          nominativo: {
            tdoc: "TESSERA STUDENTE",
            ndoc: barcode,
          } as TGenericNom,
        };
        badgeTimbra = uniDoc;
      }
      // or else search for an existing badge in order to gather nominativo's data
      else {
        // get badge for timbratura
        const fetchedBadge = await BadgesDAO.findBadgeByBarcode(barcode);
        if (!fetchedBadge) {
          throw new Error(`Badge ${barcode} non valido: non esistente`);
        } else if (fetchedBadge.tipo === "CHIAVE") {
          throw new Error(
            `Badge ${barcode} non valido: impossibile accedere con badge di tipo ${fetchedBadge.tipo}`
          );
        } else if (fetchedBadge.stato?.toUpperCase() !== "VALIDO") {
          throw new Error(`Badge ${barcode} non valido: ${fetchedBadge.stato}`);
        } else if (
          fetchedBadge.nominativo &&
          fetchedBadge.nominativo.scadenza &&
          new Date() >= new Date(fetchedBadge.nominativo.scadenza)
        ) {
          throw new Error(`Badge ${barcode} non valido: scaduto`);
        }

        badgeTimbra = fetchedBadge;
      }

      // check if is inStrutt, then "timbra esce", "timbra entra" otherwise
      const inStrutt = await archivio.findOne(
        {
          $and: [
            { "badge.barcode": barcode },
            { "data.uscita": { $eq: null } },
          ],
        },
        { projection: { _id: 1 } }
      );

      let idTimbra: ObjectId;
      let msgTimbra = "";
      
      if(inStrutt) {
        const timbraEsceResp = await this.#timbraEsce(inStrutt._id);
        if ("error" in timbraEsceResp) throw new Error(timbraEsceResp.error);
        else if (timbraEsceResp.modifiedCount === 0)
          throw new Error(
            `Non è stato possibile timbrare in uscita badge ${barcode}.`
          );

        // if badge is PROVVISORIO and is not UNIVERSITARIO and "timbra esce" then delete PROVVISORIO badge
        if (
          badgeTimbra.tipo === "PROVVISORIO" &&
          badgeTimbra.assegnazione !== "UNIVERSITARIO"
        ) {
          const deleteResp = await BadgesDAO.deleteBadge(barcode);
          if ("error" in deleteResp) throw new Error(deleteResp.error);
        }

        idTimbra = inStrutt._id;
        msgTimbra = "Timbra Esce";
      }
      else {
        const timbraEntraResp = await this.#timbraEntra(badgeTimbra, cliente, postazione, ip);
        if ("error" in timbraEntraResp) 
          throw new Error(timbraEntraResp.error);

        idTimbra = timbraEntraResp.insertedId;
        msgTimbra = "Timbra Entra";
      }

      const timbraResp = await this.#getTimbraResponse(idTimbra, msgTimbra);
      if(!timbraResp) throw new Error(`timbra: DB error`);
      return timbraResp;
    } catch(err) {
      return errCheck(err, "timbra |");
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

  // static async #timbraUnilaterale(badgeDoc: TGenericBadge, cliente: string, postazione: string, ip: string) {
  //   try {
  //     let inStrutt = await this.getInStruttBy("badge.barcode", badgeDoc.barcode);

  //     // badge è in struttura, verrà timbrata la sua uscita
  //     if (inStrutt) {
  //       const id = inStrutt._id;
  //       // aggiornamento oggetto archivio: viene settata data di uscita del badge nell'archivio
  //       const timbraEsceResp = await this.#timbraEsce(id);

  //       if("error" in timbraEsceResp)
  //         throw new Error(timbraEsceResp.error);

  //       if (timbraEsceResp.modifiedCount === 0)
  //         throw new Error(
  //           `Non è stato possibile timbrare in uscita badge ${badgeDoc.barcode}.`
  //         );

  //       return {
  //         msg: "Timbra Esce",
  //         dataEntra: inStrutt.data.entrata
  //       };
  //     // badge NON è in struttura, verrà timbrata la sua entrata
  //     } else {
  //       // creazione nuovo oggetto archivio
  //       const timbraEntraResp = await this.#timbraEntra(
  //         badgeDoc, cliente, postazione, ip
  //       );

  //       if ("error" in timbraEntraResp) 
  //         throw new Error(timbraEntraResp.error);
        
  //       // viene prelevata la data di entrata di timbratura del badge
  //       inStrutt = await this.getInStruttBy("_id", timbraEntraResp.insertedId);
  //       if (!inStrutt)
  //         throw new Error(
  //           `Non è stato possibile timbrare in entrata badge ${badgeDoc.barcode}.`
  //         );
        
  //       return {
  //         msg: "Timbra Entra",
  //         dataEntra: inStrutt.data.entrata
  //       };
  //     }
  //   } catch (err) {
  //     return errCheck("timbraUnilaterale |");
  //   }
  // }

  static async #timbraEntra(badgeDoc: TGenericBadge, cliente: string, postazione: string, ip: string) {
    try {
      const archivioDoc: TArchivio = {
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
      return errCheck("timbraEntra |");
    }
  }

  static async #timbraEsce(id: ObjectId) {
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
      return errCheck("timbraEsce |");
    }
  }

  static async getInStrutt(cliente?: string, postazione?: string) {
    const arrFilters: object[] = [
      { "data.uscita": { $eq: null } },
    ];

    if(cliente) arrFilters.push({ cliente });
    if(postazione) arrFilters.push({ postazione });

    const query: Filter<unknown> = {
      $and: arrFilters,
    };

    try {
      const cursor = archivio.find(query, {
        projection: {
          _id: 0,
          codice: "$badge.barcode",
          tipo: "$badge.tipo",
          cliente: 1,
          postazione: 1,
          assegnaz: "$badge.assegnazione",
          nome: { $ifNull: ["$badge.nominativo.nome", ""] },
          cognome: { $ifNull: ["$badge.nominativo.cognome", ""] },
          ditta: { $ifNull: ["$badge.nominativo.ditta", ""] },
          entrata: "$data.entrata",
        },
      });
      const displayCursor = cursor.limit(500).skip(0);
      const archivioList = await displayCursor.toArray();
      // console.log(archivioList);
      return archivioList;
    } catch(err) {
      errCheck(err, "getInStrutt |");
      return [];
    }
  }
}
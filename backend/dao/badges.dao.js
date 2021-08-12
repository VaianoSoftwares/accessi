let badges;

export default class BadgesDAO {
  static async injectDB(conn) {
    if (badges) {
      return;
    }

    try {
      badges = await conn.db(process.env.DB_NAME).collection("badges");
    } catch (err) {
      console.error(`DB injection failed. ${err}`);
    }
  }

  static async getBadges(filters = [], tipoBadge = "tutti") {
    let exprList = filters
      .filter((elem) => elem.value !== null)
      .map((elem) => {
        let fieldName;

        switch (elem.key) {
          case "nome":
          case "cognome":
          case "rag_soc":
          case "num_tel":
            fieldName = `nominativo.${elem.key}`;
            break;
          case "tipo_doc":
            fieldName = "nominativo.documento.tipo";
            break;
          case "cod_doc":
            fieldName = "nominativo.documento.codice";
            break;
          case "indirizzo":
          case "citta":
          case "edificio":
          case "piano":
            fieldName = `chiave.${elem.key}`;
            break;
          default:
            fieldName = elem.key;
        }

        let newElem = {};
        newElem[fieldName] = { $regex: new RegExp(elem.value, "i") };
        return newElem;
      });
    
    switch(tipoBadge) {
      case "nominativo":
        exprList
          .push({ "nominativo": { $ne: null } });
        exprList
          .push({ "chiave": { $eq: null } });
        break;
      case "chiave":
        exprList
          .push({ "nominativo": { $eq: null } });
        exprList
          .push({ "chiave": { $ne: null } });
        break;
      case "ospite":
        exprList
          .push({ "nominativo": { $eq: null } });
        exprList
          .push({ "chiave": { $eq: null } });
        break;
      case "nominativo-ospite":
        exprList
          .push({ "chiave": { $eq: null } });
        break;
      case "chiave-ospite":
        exprList
          .push({ "nominativo": { $eq: null }});
        break;
      default:
    }

    const query = exprList.length > 0 ? { $and: exprList } : null;
    console.log(query);

    try {
      const cursor = await badges.find(query);
      const displayCursor = cursor.limit(0).skip(0);
      const badgesList = await displayCursor.toArray();
      console.log(badgesList);
      return badgesList;
    } catch (err) {
      console.log(`getBadges - ${err}`);
      return [];
    }
  }

  static async findBadgeByBarcode(barcode) {
    try {
      return await badges.findOne({ "barcode": barcode });
    } catch (err) {
      console.log(`findBadgeByBarcode - ${err}`);
      return [];
    }
  }

  static async addBadge(data) {
    let badgeDoc = {
      barcode: data.barcode,
      descrizione: data.descrizione,
      reparto: data.reparto,
      ubicazione: data.ubicazione,
      nominativo: {
        nome: data.nome,
        cognome: data.cognome,
        rag_soc: data.rag_soc,
        num_tel: data.num_tel,
        documento: {
          tipo: data.tipo_doc,
          codice: data.cod_doc,
        },
        foto_profilo: data.foto_profilo,
      },
      chiave: {
        indirizzo: data.indirizzo,
        citta: data.citta,
        edificio: data.edificio,
        piano: data.piano,
      },
    };

    const nomNonNullVals = Object.values(badgeDoc.nominativo)
        .filter(value => typeof value !== "object")
        .some(value => value);
    const docNonNullVals = Object.values(badgeDoc.nominativo.documento).some(
        value => value
    );
    const isNom = nomNonNullVals || docNonNullVals;
    const isChiave = Object.values(badgeDoc.chiave).some(value => value);
    if(!isNom) {
        badgeDoc.nominativo = null;
    }
    if(!isChiave) {
        badgeDoc.chiave = null;
    }

    try {
      const badge = await this.findBadgeByBarcode(data.barcode);
      if (badge) {
        throw new Error(`Barcode ${data.barcode} già esistente.`);
      }

      return await badges.insertOne(badgeDoc);
    } catch (err) {
      console.log(`addBadge - ${err}`);
      return { error: err };
    }
  }

  static async updateBadge(data) {
    const { barcode } = data;
    let paramsToUpdate = {};

    try {
      const badge = await this.findBadgeByBarcode(barcode);
      if (!badge) {
        throw new Error(`Barcode ${barcode} non esistente.`);
      }

      Object.entries(data)
        .filter(([key, value]) => value && key !== "barcode")
        .forEach(([key, value]) => {
          switch (key) {
            case "nome":
            case "cognome":
            case "rag_soc":
            case "num_tel":
            case "foto_profilo":
              paramsToUpdate[`nominativo.${key}`] = value;
              break;
            case "tipo_doc":
              paramsToUpdate[`nominativo.documento.tipo`] = value;
              break;
            case "cod_doc":
              paramsToUpdate[`nominativo.documento.codice`] = value;
              break;
            case "indirizzo":
            case "citta":
            case "edificio":
            case "piano":
              paramsToUpdate[`chiave.${key}`] = value;
              break;
            default:
              paramsToUpdate[key] = value;
          }
        });

      if(badge.nominativo && !badge.chiave) {
        paramsToUpdate.chiave = undefined;
      }
      else if(!badge.nominativo && badge.chiave) {
        paramsToUpdate.nominativo = undefined;
      }

      const badgeId = badge._id;

      const updateResponse = await badges.updateOne(
        { _id: badgeId },
        { $set: paramsToUpdate }
      );
      return updateResponse;
    } catch (err) {
      console.log(`updateBadge - ${err}`);
      return { error: err };
    }
  }

  static async deleteBadge(barcode) {
    try {
      const deleteResponse = await badges.deleteOne({ barcode: barcode });
      return deleteResponse;
    } catch (err) {
      console.log(`deleteBadge - ${err}`);
      return { error: err };
    }
  }

  static async getReparti() {
    try {
      const reparti = await badges.distinct("reparto");
      return reparti;
    } catch (err) {
      console.log(`getReparti - ${err}`);
      return [];
    }
  }

  static async getTipiDoc() {
    try {
      const tipiDoc = await badges.distinct("nominativo.documento.tipo");
      return tipiDoc;
    } catch (err) {
      console.log(`getTipiDoc - ${err}`);
      return [];
    }
  }
};
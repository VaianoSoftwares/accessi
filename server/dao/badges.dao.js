import dateFormat from "dateformat";

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

  static async getBadges(filters = {}) {
    let exprList = Object.entries(filters)
      .filter(([key, value]) => value && !key.includes("targa"))
      .map(([key, value]) => {
        const fieldName = [
          "nome",
          "cognome",
          "ditta",
          "telefono",
          "tdoc",
          "ndoc"
        ].includes(key)
          ? `nominativo.${key}`
          : key;

        let newElem = {};
        newElem[fieldName] = { $regex: new RegExp(value, "i") };
        return newElem;
      });

    const targhe = Object.entries(filters)
      .filter(([key, value]) => value && key.includes("targa"))
      .map(([key, value]) => value);

    if (targhe.length > 0) {
      exprList.push({ "nominativo.targhe": { $all: targhe } });
    }
    
    const query = exprList.length > 0 ? { $and: exprList } : null;
    console.log(query);

    try {
      const cursor = await badges.find(query);
      const displayCursor = cursor.limit(50).skip(0);
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

  static #getBadgeDoc(data) {
    let badgeDoc = {
      barcode: data.barcode.toUpperCase(),
      descrizione: data.descrizione.toUpperCase(),
      tipo: "BADGE",
      assegnazione: data.assegnazione.toUpperCase(),
      ubicazione: data.ubicazione.toUpperCase(),
      stato: data.stato?.toUpperCase() || "VALIDO",
      nominativo: {
        nome: data.nome.toUpperCase(),
        cognome: data.cognome.toUpperCase(),
        ditta: data.ditta.toUpperCase(),
        telefono: data.telefono.toUpperCase(),
        tdoc: data.tdoc.toUpperCase(),
        ndoc: data.ndoc.toUpperCase(),
        scadenza:
          data.scadenza === ""
            ? ""
            : dateFormat(new Date(data.scadenza), "yyyy-mm-dd"),
        targhe: null,
      },
    };

    return badgeDoc;
  }

  static #getVeicoloDoc(data) {
    const veicoloDoc = {
      barcode: data.barcode.toUpperCase(),
      descrizione: data.descrizione.toUpperCase(),
      tipo: "VEICOLO",
      assegnazione: data.assegnazione.toUpperCase(),
      ubicazione: data.ubicazione.toUpperCase(),
      stato: data.stato?.toUpperCase() || "VALIDO",
      nominativo: {
        nome: data.nome.toUpperCase(),
        cognome: data.cognome.toUpperCase(),
        ditta: data.ditta.toUpperCase(),
        telefono: data.telefono.toUpperCase(),
        tdoc: data.tdoc.toUpperCase(),
        ndoc: data.ndoc.toUpperCase(),
        scadenza: "",
        targhe: {
          1: data.targa1.toUpperCase(),
          2: data.targa2.toUpperCase(),
          3: data.targa3.toUpperCase(),
          4: data.targa4.toUpperCase()
        }
      }
    };

    return veicoloDoc;
  }

  static #getChiaveDoc(data) {
    const chiaveDoc = {
      barcode: data.barcode.toUpperCase(),
      descrizione: data.descrizione.toUpperCase(),
      tipo: "CHIAVE",
      assegnazione: data.assegnazione.toUpperCase(),
      ubicazione: data.ubicazione.toUpperCase(),
      stato: data.stato?.toUpperCase() || "VALIDO",
      nominativo: {
        nome: data.nome.toUpperCase(),
        cognome: data.cognome.toUpperCase(),
        ditta: data.ditta.toUpperCase(),
        telefono: data.telefono.toUpperCase(),
        tdoc: data.tdoc.toUpperCase(),
        ndoc: data.ndoc.toUpperCase(),
        scadenza: "",
        targhe: null
      }
    };

    return chiaveDoc;
  }

  static #getProvvisorioDoc(data) {
    const provDoc = {
      barcode: data.barcode.toUpperCase(),
      descrizione: data.descrizione.toUpperCase(),
      tipo: "BADGE",
      assegnazione: data.assegnazione.toUpperCase(),
      ubicazione: data.ubicazione.toUpperCase(),
      stato: data.stato?.toUpperCase() || "VALIDO",
      nominativo: null
    };

    return provDoc;
  }

  static #isBadgeNom(data) {
    return Object.entries(data).find(
      ([key, value]) =>
        value &&
        (key.includes("targa") ||
          [
            "nome",
            "cognome",
            "ditta",
            "telefono",
            "tdoc",
            "ndoc"
          ].includes(key))
    );
  }

  static async addBadge(data) {
    try {
      const badge = await this.findBadgeByBarcode(data.barcode);
      if (badge) {
        throw new Error(`Barcode ${data.barcode} già esistente.`);
      }

      const isNom = this.#isBadgeNom(data);

      const badgeDoc = !isNom
        ? this.#getProvvisorioDoc(data)
        : !data.tipo || data.tipo === "BADGE"
        ? this.#getBadgeDoc(data)
        : data.tipo === "VEICOLO"
        ? this.#getVeicoloDoc(data)
        : data.tipo === "CHIAVE"
        ? this.#getChiaveDoc(data)
        : null;

      if(!badgeDoc) {
        throw new Error(`Tipo badge ${data.tipo} sconosciuto.`);
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
            case "ditta":
            case "telefono":
            case "tdoc":
            case "ndoc":
              paramsToUpdate[`nominativo.${key}`] = value.toUpperCase();
              break;
            case "targa1":
            case "targa2":
            case "targa3":
            case "targa4":
              paramsToUpdate[
                `nominativo.targhe.${key.charAt(key.length - 1)}`
              ] = value.toUpperCase();
              break;
            case "scadenza":
              paramsToUpdate[`nominativo.${key}`] = dateFormat(
                new Date(value),
                "yyyy-mm-dd"
              );
              break;
            default:
              paramsToUpdate[key] = value.toUpperCase();
          }
        });

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
      const deleteResponse = await badges.deleteOne({ barcode: barcode.toUpperCase() });
      return deleteResponse;
    } catch (err) {
      console.log(`deleteBadge - ${err}`);
      return { error: err };
    }
  }

  /*
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
  */
};
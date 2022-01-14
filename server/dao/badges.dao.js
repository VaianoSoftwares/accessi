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
          "ndoc",
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
      barcode: data.barcode,
      descrizione: data.descrizione,
      tipo: "badge",
      assegnazione: data.assegnazione,
      ubicazione: data.ubicazione,
      stato: data.stato || "valido",
      nominativo: {
        nome: data.nome,
        cognome: data.cognome,
        ditta: data.ditta,
        telefono: data.telefono,
        tdoc: data.tdoc,
        ndoc: data.ndoc,
        scadenza: new Date(new Date().setMonth(new Date().getMonth() + Number(data.scadenza))),
        targhe: null
      }
    };

    if(new Date() >= badgeDoc.nominativo.scadenza && badgeDoc.stato === "valido") {
      badgeDoc.stato = "scaduto";
    }
    else if(new Date() < badgeDoc.nominativo.scadenza && badgeDoc.stato === "scaduto") {
      badgeDoc.stato = "valido";
    }

    return badgeDoc;
  }

  static #getVeicoloDoc(data) {
    const veicoloDoc = {
      barcode: data.barcode,
      descrizione: data.descrizione,
      tipo: "veicolo",
      assegnazione: data.assegnazione,
      ubicazione: data.ubicazione,
      stato: data.stato || "valido",
      nominativo: {
        nome: data.nome,
        cognome: data.cognome,
        ditta: data.ditta,
        telefono: data.telefono,
        tdoc: data.tdoc,
        ndoc: data.ndoc,
        scadenza: null,
        targhe: {
          1: data.targa1,
          2: data.targa2,
          3: data.targa3,
          4: data.targa4
        }
      }
    };

    return veicoloDoc;
  }

  static #getChiaveDoc(data) {
    const chiaveDoc = {
      barcode: data.barcode,
      descrizione: data.descrizione,
      tipo: "chiave",
      assegnazione: data.assegnazione,
      ubicazione: data.ubicazione,
      stato: data.stato || "valido",
      nominativo: {
        nome: data.nome,
        cognome: data.cognome,
        ditta: data.ditta,
        telefono: data.telefono,
        tdoc: data.tdoc,
        ndoc: data.ndoc,
        scadenza: null,
        targhe: null
      }
    };

    return chiaveDoc;
  }

  static #getProvvisorioDoc(data) {
    const provDoc = {
      barcode: data.barcode,
      descrizione: data.descrizione,
      tipo: "chiave",
      assegnazione: data.assegnazione,
      ubicazione: data.ubicazione,
      stato: data.stato || "valido",
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
        : !data.tipo || data.tipo === "badge"
        ? this.#getBadgeDoc(data)
        : data.tipo === "veicolo"
        ? this.#getVeicoloDoc(data)
        : this.#getChiaveDoc(data);

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
          if(["nome", "cognome", "ditta", "telefono", "tdoc", "ndoc"].includes(key)) {
            paramsToUpdate[`nominativo.${key}`] = value;
          }
          else if(key.includes("targa")) {
            paramsToUpdate[`nominativo.targhe.${key.charAt(key.length - 1)}`] = value;
          }
          else if(key === "scadenza" && Number(value) > 0) {
            paramsToUpdate[`nominativo.scadenza`] = 
              new Date(new Date().setMonth(new Date().getMonth() + Number(value)));
          }
          else {
            paramsToUpdate[key] = value;
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
      const deleteResponse = await badges.deleteOne({ barcode: barcode });
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
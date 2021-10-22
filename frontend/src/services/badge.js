import http from "../http-common.js";

class BadgesDataService {
  token;

  getAll() {
    return http.get("/badges", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  find(query = {}) {
    if (
      Object.keys(query).length === 0 ||
      !Object.values(query).some((value) => value !== null)
    )
      return this.getAll();

    const params = Object.entries(query)
      .filter((elem) => elem[1])
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    console.log(params);
    return http.get(`/badges?${params}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  insertBadge(data) {
    return http.post("/badges", data, {
      headers: {
        "auth-token": this.token,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  updateBadge(data) {
    return http.put("/badges", data, {
      headers: {
        "auth-token": this.token,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  deleteBadge(barcode) {
    return http.delete(`/badges?barcode=${barcode}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getAssegnazioni(tipo = "") {
    return http.get(`/badges/assegnazioni?tipo=${tipo}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  insertAssegnazione(tipo, assegnaz) {
    return http.post("/badges/assegnazioni", { tipo, assegnaz }, {
      headers: {
        "auth-token": this.token
      }
    });
  }

  deleteAssegnazione(tipo, assegnaz) {
    return http.delete(`/badges/assegnazioni?tipo=${tipo}&assegnaz=${assegnaz}`, {
      headers: {
        "auth-token": this.token
      }
    });
  }

  getTipiDoc() {
    return http.get("/badges/tipi-doc", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getStati() {
    return http.get("/badges/stati", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getTipiBadge() {
    return http.get("/badges/tipi", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getArchivio({ inizio = "", fine = "" }) {
    return http.get(`/badges/archivio?inizio=${inizio}&fine=${fine}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getInStrutt(tipo = "") {
    return http.get(`/badges/archivio/in-struttura?tipo=${tipo}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  timbra(data) {
    return http.post("/badges/archivio", data, {
      headers: {
        "auth-token": this.token,
      },
    });
  }
}

export default new BadgesDataService();
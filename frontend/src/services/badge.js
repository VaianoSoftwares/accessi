import http from "../http-common.js";

class BadgesDataService {
  token;

  getAll(tipo = "tutti") {
    return http.get(`/badges/tipo/${tipo}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  find(tipo = "tutti", query = {}) {
    if (
      Object.keys(query).length === 0 ||
      !Object.values(query).some((value) => value !== null)
    )
      return this.getAll(tipo);

    const params = Object.entries(query)
      .filter((elem) => elem[1])
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    console.log(params);
    return http.get(`/badges/tipo/${tipo}/?${params}`, {
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

  getReparti() {
    return http.get("/badges/reparti", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getTipiDoc() {
    return http.get("/badges/tipi-doc", {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getArchivio(entrata = "", uscita = "") {
    return http.get(`/badges/archivio?entrata=${entrata}&uscita=${uscita}`, {
      headers: {
        "auth-token": this.token,
      },
    });
  }

  getInStrutt() {
    return http.get("/badges/archivio/in-struttura", {
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
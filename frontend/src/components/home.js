import React from "react";
import dateFormat from "dateformat";

import BadgeDataService from "../services/badge.js";
import SerialApi from "../services/serial-api.js";

import Navbar from "./accessi-navbar";
import BadgeForm from "./badge-form.js";
import BadgeTable from "./badge-table.js";
import Clock from "./clock.js";
import FormButtons from "./formButtons.js";

const Home = props => {
  const initialBadgeFormState = {
    barcode: "",
    descrizione: "",
    tipo: "badge",
    assegnazione: "",
    stato: "",
    ubicazione: "",
    nome: "",
    cognome: "",
    telefono: "",
    ditta: "",
    tipo_doc: "",
    ndoc: "",
    foto_profilo: null,
    scadenza: dateFormat(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-mm-dd"),
    targa1: "",
    targa2: "",
    targa3: "",
    targa4: ""
  };

  const initialArchivioFormState = {
    inizio: dateFormat(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-mm-dd"),
    fine: dateFormat(new Date(), "yyyy-mm-dd")
  };

  const [badges, setBadges] = React.useState([]);
  const [badgeForm, setBadgeForm] = React.useState(initialBadgeFormState);
  const [archivioForm, setArchivioForm] = React.useState(initialArchivioFormState);
  //const [tableContentType, setTableContentType] = React.useState("in_struttura");
  
  React.useEffect(() => {
    BadgeDataService.token = props.token;
    console.log(`props.token: ${props.token} - BadgeDataService.token: ${BadgeDataService.token}`);
    retriveInStrutt();
  }, []);
  
  React.useEffect(() => {
    retriveInStrutt();
  }, [badgeForm.tipo]);

  const handleInputChanges = e => {
    const { name, value } = e.target;
    setBadgeForm({ ...badgeForm, [name]: value });
  };

  const handleInputFileChanges = e => {
    const { name, files } = e.target;
    setBadgeForm({ ...badgeForm, [name]: files[0] });
  };

  const handleInputChangesArchivio = e => {
    const { name, value } = e.target;
    setArchivioForm({ ...archivioForm, [name]: value });
  };

  const retriveInStrutt = () => {
    BadgeDataService.getInStrutt(badgeForm.tipo)
      .then(response => {
        console.log(response.data);
        setBadges(mapToTableContent(response.data.data));
      })
      .catch(err => {
        console.log(err);
      });
  };
  /*
  const retriveBadges = () => {
    BadgeDataService.getAll()
      .then(response => {
        console.log(response.data);
        setBadges(mapToTableContent(response.data.data));
      })
      .catch(err => {
        console.log(err);
      });
  };
  
  const findArchivio = () => {
    setTableContentType("archivio");
    BadgeDataService.getArchivio(archivioForm)
      .then(response => {
        console.log(response.data);
        setBadges(mapToTableContent(response.data.data));
      })
      .catch(err => {
        console.log(err);
      });
  };
  */
  const findBadges = () => {
    BadgeDataService.find(badgeForm)
      .then(response => {
        console.log(response.data);
        const findResponse = mapToTableContent(response.data.data); 
        setBadges(findResponse);
        if(findResponse.length === 1) {
          autocompleteForm(findResponse[0]);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const timbra = () => {
    retriveInStrutt();
    BadgeDataService.timbra(badgeForm)
      .then(response => {
        console.log(response.data);

        const rowTimbra = response.data.data;
        const filteredBadges = badges.filter(badge => badge.codice !== rowTimbra.barcode);
        setBadges(mapToTableContent([ rowTimbra, ...filteredBadges ]));
        console.log("badges");
        console.log(badges);

        const { msg } = response.data;
        const firstRow = document.querySelector("table.badge-table").tBodies[0].rows[0];
        firstRow.style.backgroundColor = msg === "Timbra Entra" ? "green" : "red";

        setTimeout(() => {
          firstRow.style.backgroundColor = "white";
          if(msg === "Timbra Esce") {
            setBadges(filteredBadges);
          }
        }, 4000);
      })
      .catch(err => {
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data;
          props.setAlert({ success, msg });
        }
      });
  };

/*
  const insertBadge = () => {
    if(tableContentType !== "chiave") {
      setTableContentType("_nominativo");
    }
    const formData = createFormData();
    BadgeDataService.insertBadge(formData)
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
        retriveBadges();
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setDefaultPfp();
      });
  };

  const updateBadge = () => {
    const confirmed = window.confirm("Procedere alla modifica del badge?");
		if (!confirmed) {
      return;
    }
    
    if(tableContentType !== "chiave") {
      setTableContentType("_nominativo");
    }

    const formData = createFormData();
    BadgeDataService.updateBadge(formData)
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
        retriveBadges();
        setBadgeForm(initialBadgeFormState);
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setDefaultPfp();
      });
  };

  const deleteBadge = () => {
    const confirmed = window.confirm("Procedere alla rimozione del badge?");
		if (!confirmed) {
      return;
    }
    
    if(tableContentType !== "chiave") {
      setTableContentType("_nominativo");
    }

    BadgeDataService.deleteBadge(badgeForm.barcode)
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
        retriveBadges();
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setDefaultPfp();
      });
  };

  const createFormData = () => {
    const formData = new FormData();
    Object.entries(badgeForm).forEach(([key, value]) => formData.append(key, value));
    
    return formData;
  };
  */

  const mapToTableContent = (data = []) => {
    return data.map(elem => {
      if(elem.codice) {
        return elem;
      }

      let mappedElem = {
        codice: elem.barcode,
        tipo: elem.tipo,
        assegnaz: elem.assegnazione || null,
      };
      
      if(elem.nominativo) {
        mappedElem["nome"] = elem.nominativo.nome || null;
        mappedElem["cognome"] = elem.nominativo.cognome || null;
        mappedElem["ditta"] = elem.nominativo.ditta || null;
      }
      else {
        mappedElem["nome"] = mappedElem["cognome"] = mappedElem["ditta"] = null;
      }

      let dataEntra = null;
      if(elem.data) {
        dataEntra = new Date(elem.data.entrata);
        dataEntra = new Date(dataEntra.setHours(dataEntra.getHours() - 2));
        dataEntra = dateFormat(dataEntra, "dd-mm-yyyy HH:MM:ss");
      }
      const dataEntraKey = badgeForm.tipo.includes("chiave") ? "data ora consegna" : "data ora in";
      mappedElem[dataEntraKey] = dataEntra;

      return mappedElem;
    });
  };

  const autocompleteForm = badge => {
    Object.entries(badge)
      .filter(elem => elem[0] !== "foto_profilo")
      .forEach(([key, value]) => {
        const input = document.querySelector(
          `div.submit-form input[name=${key}]`
        );
        if (input) {
          input.value = value;
        }
      });
    console.log(`autocompleteForm - ${badge.foto_profilo}`);
    console.log(badge);
    if(badge.foto_profilo) {
      const pfp = document.querySelector("div.nom-form img");
      pfp.src =`${window.env.API_URL}/public/foto-profilo/${badge.foto_profilo}`;
    }
  };

  const setDefaultPfp = () => {
    const pfp = document.querySelector("div.nom-form img");
    pfp.src = window.env.DEFAULT_IMG;
  };

  const refreshPage = () => {
    setBadgeForm(initialBadgeFormState);
    setArchivioForm(initialArchivioFormState);
    retriveInStrutt();
    setDefaultPfp();
  }

  const serialApi = async () => {
    let serialPort;
    let readableStreamClosed;
    let serialReader;

    try {
      serialPort = await SerialApi.connect();

      // eslint-disable-next-line no-undef
      const textDecoder = new TextDecoderStream();
      readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
      serialReader = textDecoder.readable.getReader();
      console.log(
        "serialApi - Oggetto Reader creato. In ascolto sulla porta seriale."
      );
      
      // Listen to data coming from the serial device.
      while (true) {
        const { value, done } = await serialReader.read();

        if (done) {
          // Allow the serial port to be closed later.
          serialReader.releaseLock();
          break;
        }

        if (value) {
          console.log("serialApi - Lettura seriale terminata.");
          console.log(`serialApi - value: ${value} - done: ${done}`);

          const scannedValue = value
            .replace(/[\n\r]+/g, "")
            .replace(/\s{2,10}/g, " ")
            .trim();

          console.log(`serialApi - Value (trimmed): ${scannedValue}`);
          badgeForm.barcode = scannedValue;

          timbra();
        }
      }
    } catch(err) {
      console.log(err);
    } finally {
      await SerialApi.close(readableStreamClosed, serialReader, serialPort);
    }
  };

  return (
    <div id="home-wrapper">
      <Navbar {...props} user={props.user} logout={props.logout} />
      <br />
      <div className="btn-menu">
        <div className="row">
          <div className="col-sm-6">
            <button
              onClick={() => setBadgeForm({ ...badgeForm, tipo: "badge" })}
              className="btn btn-outline-secondary d-inline-block"
            >
              badge
            </button>
            <button
              onClick={() => setBadgeForm({ ...badgeForm, tipo: "veicolo" })}
              className="btn btn-outline-secondary d-inline-block"
            >
              veicoli
            </button>
            <button
              onClick={() => setBadgeForm({ ...badgeForm, tipo: "chiave" })}
              className="btn btn-outline-secondary d-inline-block"
            >
              chiavi
            </button>
            <button
              onClick={() => {}/*findArchivio()*/}
              className="btn btn-outline-secondary"
            >
              archivio
            </button>
            <input
              type="date"
              className=""
              placeholder="data inizio"
              value={archivioForm.inizio}
              name="inizio"
              onChange={handleInputChangesArchivio}
            />
            <input
              type="date"
              className=""
              placeholder="data fine"
              value={archivioForm.fine}
              name="fine"
              onChange={handleInputChangesArchivio}
            />
          </div>
          <div className="col-lg-2">
            <button
              onClick={async () => await serialApi()}
              className="btn btn-outline-secondary"
            >
              Connetti Seriale
            </button>
          </div>
        </div>
      </div>
      <div className="submit-form">
        <BadgeForm
          {...props}
          badgeForm={badgeForm}
          handleInputChanges={handleInputChanges}
          handleInputFileChanges={handleInputFileChanges}
        />
        <FormButtons 
          {...props}
          timbra={timbra}
          findBadges={findBadges}
          refreshPage={refreshPage}
        />
      </div>
      <br />
      <BadgeTable
        {...props}
        badges={badges}
      />
      <Clock />
    </div>
  );
}

export default Home;
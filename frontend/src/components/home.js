import React from "react";
import dateFormat from "dateformat";

import BadgeDataService from "../services/badge.js";
import SerialApi from "../services/serial-api.js";

import Navbar from "./accessi-navbar";
import BadgeForm from "./badge-form.js";
import BadgeTable from "./badge-table.js";
import NomForm from "./nom-form.js";
import ChiaveForm from "./chiave-form.js";
import Clock from "./clock.js";

const Home = props => {
  const initialBadgeFormState = {
    barcode: "",
    descrizione: "",
    reparto: "",
    ubicazione: "",
    nome: "",
    cognome: "",
    num_tel: "",
    rag_soc: "",
    tipo_doc: "",
    cod_doc: "",
    foto_profilo: null,
    indirizzo: "",
    edificio: "",
    citta: "",
    piano: ""
  };

  const addHours = (date, h) => {
    if(!date)
      date = new Date();
    date.setHours(date.getHours() + h);
    return date;
  };

  const addDays = (date, d) => {
    if(!date)
      date = new Date();
    date.setDate(date.getDate() + d);
    return date;
  };

  const initialArchivioFormState = {
    inizio: dateFormat(addDays(new Date(), -1), "yyyy-mm-dd"),
    fine: dateFormat(new Date(), "yyyy-mm-dd")
  };

  const [badges, setBadges] = React.useState([]);
  const [badgeForm, setBadgeForm] = React.useState(initialBadgeFormState);
  const [archivioForm, setArchivioForm] = React.useState(initialArchivioFormState);
  const [tableContentType, setTableContentType] = React.useState("in_struttura");
  
  React.useEffect(() => {
    BadgeDataService.token = props.token;
    console.log(`props.token: ${props.token} - BadgeDataService.token: ${BadgeDataService.token}`);
    setTableContentType("in_struttura");
  }, []);
  
  React.useEffect(() => {
    switch(tableContentType) {
      case "in_struttura":
        retriveInStrutt();
        break;
      case "nominativo":
      case "chiave":
      case "ospite":
        retriveBadges(tableContentType);
        break;
      default:
    }
  }, [tableContentType]);

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
    BadgeDataService.getInStrutt()
      .then(response => {
        console.log(response.data);
        setBadges(mapToTableContent(response.data.data));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const retriveBadges = (tipo = "tutti") => {
    tipo = tableContentType === "chiave" ? "chiave-ospite" : "nominativo-ospite";
    BadgeDataService.getAll(tipo)
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

  const findBadges = () => {
    const findParam = tableContentType === "chiave" ? "chiave-ospite" : "nominativo-ospite";
    if(tableContentType !== "chiave") {
      setTableContentType("_nominativo");
    }
    BadgeDataService.find(findParam, badgeForm)
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

  const timbra = () => {
    setTableContentType("in_struttura");
    BadgeDataService.timbra(badgeForm)
      .then(response => {
        console.log(response.data);

        const { success, msg } = response.data;
        props.setAlert({ success, msg });

        const rowTimbra = response.data.data;
        const filteredBadges = badges.filter(badge => badge.barcode !== rowTimbra.barcode);
        setBadges(mapToTableContent([ rowTimbra, ...filteredBadges ]));

        const firstRow = document.querySelector("table.badge-table").tBodies[0].rows[0];
        firstRow.style.backgroundColor = msg === "Timbra Entra" ? "green" : "red";

        setTimeout(() => {
          firstRow.style.backgroundColor = "white";
          if(msg === "Timbra Esce") {
            setBadges(mapToTableContent(filteredBadges));
          }
        }, 4000);
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      });
  };

  const createFormData = () => {
    const formData = new FormData();
    Object.entries(badgeForm).forEach(elem => formData.append(elem[0], elem[1]));
    /*
    const pfp = document.querySelector("#foto_profilo");
    formData.append("fotoProfilo", pfp);
    */
    return formData;
  };

  const mapToTableContent = (data = []) => {
    return data.map(elem => {
      if(elem.nominativo) {
        elem["nome"] = elem.nominativo.nome;
        elem["cognome"] = elem.nominativo.cognome;
        elem["rag_soc"] = elem.nominativo.rag_soc;
        elem["num_tel"] = elem.nominativo.num_tel;
        if(elem.nominativo.documento) {
          elem["tipo_doc"] = elem.nominativo.documento.tipo;
          elem["cod_doc"] = elem.nominativo.documento.codice;
        }
        elem["foto_profilo"] = elem.nominativo.foto_profilo;
      }
      if(elem.chiave) {
        elem["indirizzo"] = elem.chiave.indirizzo;
        elem["edificio"] = elem.chiave.edificio;
        elem["citta"] = elem.chiave.citta;
        elem["piano"] = elem.chiave.piano;
      }
      if(elem.data) {
        elem["dataEntra"] = dateFormat(addHours(new Date(elem.data.entrata), -2), "dd-mm-yyyy HH:MM:ss");
        elem["dataEsce"] = elem.data.uscita
          ? dateFormat(
              addHours(new Date(elem.data.uscita), -2),
              "dd-mm-yyyy HH:MM:ss"
            )
          : undefined;
      }
      elem.nominativo = elem.chiave = elem.data = elem._id = undefined;
  
      return elem;
    });
  };

  const autocompleteForm = badge => {
    Object.entries(badge)
      .filter(elem => elem[0] !== "foto_profilo")
      .forEach(elem => {
        const input = document.querySelector(
          `div.submit-form input[name=${elem[0]}]`
        );
        if (input) {
          input.value = elem[1];
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
    setTableContentType("in_struttura");
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
    <div>
      <Navbar {...props} user={props.user} logout={props.logout} />
      <br />
      <div className="btn-menu">
        <div className="row">
          <div className="col-lg-5">
            <button
              onClick={() => setTableContentType("in_struttura")}
              className="btn btn-outline-secondary d-inline-block"
            >
              in struttura
            </button>
            <button
              onClick={() => setTableContentType("nominativo")}
              className="btn btn-outline-secondary d-inline-block"
            >
              nominativi
            </button>
            <button
              onClick={() => setTableContentType("chiave")}
              className="btn btn-outline-secondary d-inline-block"
            >
              chiavi
            </button>
            <button
              onClick={() => findArchivio()}
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
        />
        {tableContentType.includes("chiave") ? (
          <ChiaveForm
            {...props}
            badgeForm={badgeForm}
            handleInputChanges={handleInputChanges}
          />
        ) : (
          <NomForm
            {...props}
            badgeForm={badgeForm}
            handleInputChanges={handleInputChanges}
            handleInputFileChanges={handleInputFileChanges}
          />
        )}
        <div className="form-buttons row">
          <div className="col-lg-3">
            <button onClick={() => timbra()} className="btn btn-success">
              Timbra
            </button>
            <button onClick={() => findBadges()} className="btn btn-success">
              Cerca
            </button>
            <button onClick={() => insertBadge()} className="btn btn-success">
              Inserisci
            </button>
            <button onClick={() => updateBadge()} className="btn btn-success">
              Aggiorna
            </button>
            <button onClick={() => deleteBadge()} className="btn btn-success">
              Elimina
            </button>
          </div>
          <div className="col-lg-2">
            <button onClick={() => refreshPage()} className="btn btn-success">
              Refresh
            </button>
          </div>
        </div>
      </div>
      <br />
      <BadgeTable
        {...props}
        badges={badges}
        tableContentType={tableContentType}
      />
      <Clock />
    </div>
  );
}

export default Home;
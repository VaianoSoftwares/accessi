import React from "react";

import BadgeDataService from "../services/badge.js";
import SerialApi from "../services/serial-api.js";

import Navbar from "./accessi-navbar";
import BadgeForm from "./badge-form.js";
import BadgeTable from "./badge-table.js";
import NomForm from "./nom-form.js";
import ChiaveForm from "./chiave-form.js";

const Home = props => {
  const initialBadgeFormState = {
    barcode: "",
    descrizione: "",
    reparto: "",
    ubicazione: "",
    nome: "",
    cognome: "",
    numTel: "",
    ragSoc: "",
    tipoDoc: "",
    codDoc: "",
    fotoProfilo: "",
    indirizzo: "",
    edificio: "",
    citta: "",
    piano: ""
  };

  const getCurrDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
    const day = now.getDate() >= 10 ? now.getDate() : `0${now.getDate()}`;
    return [year, month, day].join("-");
  };

  const initialArchivioFormState = {
    inizio: getCurrDate(),
    fine: getCurrDate()
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
    BadgeDataService.find("tutti", badgeForm)
      .then(response => {
        console.log(response.data);
        const findResponse = mapToTableContent(response.data.data); 
        setBadges(findResponse);
        if(findResponse.length === 1) {
          autocompleteForm();
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const insertBadge = () => {
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
      });
  };

  const updateBadge = () => {
    const formData = createFormData();
    BadgeDataService.updateBadge(formData)
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
      });
  };

  const deleteBadge = () => {
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
        setBadges(mapToTableContent([ rowTimbra, ...badges ]));

        if(response.data.msg && response.data.msg === "Timbra Esce") {
          setTimeout(() => {
            setBadges(mapToTableContent(badges));
          }, 4000);
        }
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
    const pfp = document.querySelector("#foto_profilo");
    formData.append("fotoProfilo", pfp);
    return formData;
  };

  const mapToTableContent = (data = []) => {
    return data.map(elem => {
      if(elem.nominativo) {
        elem["nome"] = elem.nominativo.nome;
        elem["cognome"] = elem.nominativo.cognome;
        elem["ragSoc"] = elem.nominativo.ragSoc;
        elem["numTel"] = elem.nominativo.numTel;
        if(elem.nominativo.documento) {
          elem["tipoDoc"] = elem.nominativo.documento.tipo;
          elem["codDoc"] = elem.nominativo.documento.codice;
        }
        elem["fotoProfilo"] = elem.nominativo.fotoProfilo;
      }
      if(elem.chiave) {
        elem["indirizzo"] = elem.chiave.indirizzo;
        elem["edificio"] = elem.chiave.edificio;
        elem["citta"] = elem.chiave.citta;
        elem["piano"] = elem.chiave.piano;
      }
      if(elem.data) {
        elem["dataEntra"] = elem.data.entrata;
        elem["dataEsce"] = elem.data.uscita;
      }
      elem.nominativo = elem.chiave = elem.data = elem._id = undefined;
      if(props.tableContentType === "in_struttura")
        elem.dataEsce = undefined;
  
      return elem;
    });
  };

  const autocompleteForm = () => {
    Object.entries(badges[0]).forEach(elem => {
      const input = document.querySelector(`div.submit-form input[name=${elem[0]}]`);
      input.value = elem[1];
    });
    if(badges[0].fotoProfilo) {
      const pfp = document.querySelector("div.nom-form img");
      pfp.src =`${window.env.API_URL}/public/foto-profilo/USER_${badges[0].barcode}.*`;
    }
  };

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

          timbra({ ...badgeForm, barcode: scannedValue });
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
      <button onClick={() => serialApi} className="btn btn-outline-secondary">
        Connetti Seriale
      </button>
      <div className="">
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
        <div className="input-group col-lg-4">
          <div className="input-group-append">
            <button
              onClick={() => findArchivio}
              className="btn btn-outline-secondary"
            >
              archivio
            </button>
          </div>
          <input
            type="date"
            className="form-control"
            placeholder="data inizio"
            value={archivioForm.inizio}
            onChange={handleInputChangesArchivio}
          />
          <input
            type="date"
            className="form-control"
            placeholder="data fine"
            value={archivioForm.fine}
            onChange={handleInputChangesArchivio}
          />
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
          />
        )}
        <button onClick={() => timbra} className="btn btn-success">
          Timbra
        </button>
        <button onClick={() => findBadges} className="btn btn-success">
          Cerca
        </button>
        <button onClick={() => insertBadge} className="btn btn-success">
          Inserisci
        </button>
        <button onClick={() => updateBadge} className="btn btn-success">
          Aggiorna
        </button>
        <button onClick={() => deleteBadge} className="btn btn-success">
          Elimina
        </button>
      </div>
      <BadgeTable {...props} badges={badges} tableContentType={tableContentType} />
    </div>
  );
}

export default Home;
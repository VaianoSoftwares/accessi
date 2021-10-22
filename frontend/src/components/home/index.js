/* eslint-disable react-hooks/exhaustive-deps */

import React from "react";
import dateFormat from "dateformat";
import _ from "underscore";

import "./index.css";

import BadgeDataService from "../../services/badge.js";

import Navbar from "../accessi-navbar";
import BadgeForm from "../badge-form";
import BadgeTable from "../badge-table.js";
import Clock from "../clock";
import FormButtons from "../form-buttons";
import { OspitiPopup } from "../ospiti-popup";
import SerialComponent from "../serial-component.js";
import Alert from "../alert";

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
    scadenza: 0/*dateFormat(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-mm-dd")*/,
    targa1: "",
    targa2: "",
    targa3: "",
    targa4: ""
  };
  /*
  const initialArchivioFormState = {
    inizio: dateFormat(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-mm-dd"),
    fine: dateFormat(new Date(), "yyyy-mm-dd")
  };
  */

  const defaultTableContentElem = {
    codice: "",
    tipo: "",
    assegnaz: "",
    nome: "",
    cognome: "",
    ditta: "",
    "data ora consegna": undefined,
    "data ora in": undefined
  };

  const [badges, setBadges] = React.useState([]);
  const [badgeForm, setBadgeForm] = React.useState(initialBadgeFormState);
  //const [archivioForm, setArchivioForm] = React.useState(initialArchivioFormState);
  const [tipiDoc, setTipiDoc] = React.useState([]);
  const [isShown, setIsShown] = React.useState(false);
  const [readOnlyForm, setReadOnlyForm] = React.useState(true);
  const [scannedValue, setScannedValue] = React.useState("");
  const [timeoutRunning, setTimeoutRunning] = React.useState(false);
  
  React.useEffect(() => {
    BadgeDataService.token = props.token;
    //console.log(`props.token: ${props.token} - BadgeDataService.token: ${BadgeDataService.token}`);
    retriveTipiDoc();
    props.setAlert(null);
  }, []);
  
  React.useEffect(() => {
    retriveInStrutt();
  }, [badgeForm.tipo]);

  React.useEffect(() => {
    //toggleReadonlyInputs(readOnlyForm);
    if(readOnlyForm === true) {
      setBadgeForm({ ...initialBadgeFormState, tipo: badgeForm.tipo });
      retriveInStrutt();
    }
    console.log(`readOnlyForm: ${readOnlyForm}`);
  }, [readOnlyForm]);

  React.useEffect(() => {
    if(scannedValue) {
      timbra({ barcode: scannedValue });
      setScannedValue("");
    }
  }, [scannedValue]);

  const handleInputChanges = e => {
    const { name, value } = e.target;
    setBadgeForm({ ...badgeForm, [name]: value });
  };

  const handleInputFileChanges = e => {
    const { name, files } = e.target;
    setBadgeForm({ ...badgeForm, [name]: files[0] });
  };
  /*
  const handleInputChangesArchivio = e => {
    const { name, value } = e.target;
    setArchivioForm({ ...archivioForm, [name]: value });
  };
  */
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

  const retriveTipiDoc = () => {
    BadgeDataService.getTipiDoc()
      .then((response) => {
        //console.log(response.data);
        setTipiDoc(response.data.data);
      })
      .catch((err) => {
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
  };*/
  
  const findBadges = () => {
    BadgeDataService.find(_.omit(badgeForm, "scadenza"))
      .then(response => {
        console.log(response.data);

        const findResponse = response.data.data; 

        if(findResponse.length === 1) {
          const mappedBadge = mapToAutoComplBadge(findResponse[0]);
          setBadgeForm(mappedBadge);
          setPfp(mappedBadge.barcode);
        }
        
        setBadges(mapToTableContent(findResponse));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const timbra = (data = {}) => {
    if(timeoutRunning === false)
      retriveInStrutt();
    BadgeDataService.timbra(data)
      .then(response => {
        console.log(response.data);
        console.log(`timbra - readOnlyForm: ${readOnlyForm}`);

        if(timeoutRunning === true)
          return;

        setTimeoutRunning(true);

        const rowTimbra = response.data.data;
        
        if(readOnlyForm === true) {
          setBadgeForm(mapToAutoComplBadge(rowTimbra));
          setPfp(rowTimbra.barcode);
        }                                    

        const filteredBadges = badges
          .filter(badge => badge.codice !== rowTimbra.barcode);
        setBadges(mapToTableContent([ rowTimbra, ...filteredBadges ]));                        

        const { msg } = response.data;
        const firstRow = document.querySelector("table.badge-table").tBodies[0].rows[0];
        firstRow.style.backgroundColor = msg === "Timbra Entra" ? "green" : "red";

        setTimeout(() => {
          firstRow.style.backgroundColor = "white";
          if(readOnlyForm === true) {
            setBadgeForm(initialBadgeFormState);
          }
          /*
          if(msg === "Timbra Esce") {
            setBadges(filteredBadges);
          }
          */
          retriveInStrutt();
          
          setTimeoutRunning(false);
        }, 1000);
      })
      .catch(err => {
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data;
          props.setAlert({ success, msg });
        }
      });
  };

  const insertBadge = () => {
    const formData = createFormData();
    BadgeDataService.insertBadge(formData)
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
        //retriveBadges();
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfp();
      });
  };

  const updateBadge = () => {
    const confirmed = window.confirm("Procedere alla modifica del badge?");
		if (!confirmed) {
      return;
    }

    const formData = createFormData();
    BadgeDataService.updateBadge(formData)
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
        //retriveBadges();
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfp();
      });
  };

  const deleteBadge = () => {
    const confirmed = window.confirm("Procedere alla rimozione del badge?");
		if (!confirmed) {
      return;
    }

    BadgeDataService.deleteBadge(badgeForm.barcode)
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
        //retriveBadges();
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfp();
      });
  };

  const createFormData = () => {
    const formData = new FormData();
    Object.entries(badgeForm)
      .forEach(([key, value]) => formData.append(key, value));
    
    if(formData.has("foto_profilo") && !badgeForm.foto_profilo)
      formData.delete("foto_profilo");
    
    return formData;
  };

  const mapToTableContent = (data = []) => {
    return data.map(elem => {
      if(elem.codice) {
        return elem;
      }

      let mappedElem = _.object(
        ["codice", "tipo", "assegnaz"],
        _.values(_.pick(elem, "barcode", "tipo", "assegnazione"))
      );
      
      if(elem.nominativo) {
        const elemNom = _.pick(elem.nominativo, "nome", "cognome", "ditta");
        mappedElem = _.extend(mappedElem, elemNom);
      }

      let dataEntra = null;
      if(elem.data) {
        dataEntra = new Date(elem.data.entrata);
        dataEntra = new Date(dataEntra.setHours(dataEntra.getHours() - 2));
        dataEntra = dateFormat(dataEntra, "dd-mm-yyyy HH:MM:ss");
      }
      const dataEntraKey = badgeForm.tipo.includes("chiave") ? "data ora consegna" : "data ora in";
      mappedElem[dataEntraKey] = dataEntra;

      return _.defaults(mappedElem, defaultTableContentElem);
    });
  };

  const mapToAutoComplBadge = (badge) => {
    let mappedBadge = _.omit(badge, "nominativo", "_id");

    if(badge.nominativo) {
      const badgeNom = _.omit(badge.nominativo, "targhe");
      mappedBadge = _.extend(mappedBadge, badgeNom);
      if(badge.nominativo.targhe) {
        const badgeTarghe = _.object(
          ["targa1", "targa2", "targa3", "targa4"],
          _.values(badge.nominativo.targhe)
        );
        mappedBadge = _.extend(mappedBadge, badgeTarghe);
      }
    }

    return _.defaults(mappedBadge, initialBadgeFormState);
  };

  const setPfp = (barcode = null) => {
    const pfp = document.querySelector("img.pfp");
    if(!pfp) return;
    pfp.src = barcode
      ? `${window.env.API_URL}/public/foto-profilo/USER_${barcode}.jpg`
      : window.env.DEFAULT_IMG;
  };

  const refreshPage = () => {
    setBadgeForm(initialBadgeFormState);
    //setArchivioForm(initialArchivioFormState);
    retriveInStrutt();
    setPfp();
  };
  /*
  const toggleReadonlyInputs = (readOnly) => {
    _.keys(badgeForm)
      .map((key) => document.querySelector(`.badge-form input#${key}`))
      .filter((input) => input)
      .forEach((input) => (input.readOnly = readOnly));

    _.pairs(badgeForm)
      .flatMap(([key, value]) => {
        const options = document.querySelectorAll(
          `.badge-form select#${key} option:not([value="${value}"])`
        );
        return Array.from(options);
      })
      .filter((option) => option)
      .forEach((option) => (option.disabled = readOnly));
  };
  */

  return (
    <div id="home-wrapper">
      <Navbar
        {...props}
        user={props.user}
        logout={props.logout}
        tipoBadge={badgeForm.tipo}
      />
      <br />
      <div className="btn-menu">
        <div className="row">
          <div className="col-sm-3 m-1">
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
          </div>
          <div className="col-sm-2">
            <SerialComponent
              timbra={timbra}
              setScannedValue={setScannedValue}
            />
          </div>
        </div>
      </div>
      <div className="submit-form">
        <BadgeForm
          {...props}
          badgeForm={badgeForm}
          handleInputChanges={handleInputChanges}
          handleInputFileChanges={handleInputFileChanges}
          tipiDoc={tipiDoc}
          setPfp={setPfp}
          readOnlyForm={readOnlyForm}
        />
        <FormButtons
          {...props}
          findBadges={findBadges}
          insertBadge={insertBadge}
          updateBadge={updateBadge}
          deleteBadge={deleteBadge}
          refreshPage={refreshPage}
          setIsShown={setIsShown}
          setReadOnlyForm={setReadOnlyForm}
          admin={props.user.admin}
        />
      </div>
      <div
        className="in-strutt-count"
      >
        <b># in struttura:</b> {badges.length}
      </div>
      <br />
      <BadgeTable {...props} badges={badges} />
      <Clock />
      <OspitiPopup
        isShown={isShown}
        setIsShown={setIsShown}
        tipiDoc={tipiDoc}
        timbra={timbra}
        isVeicolo={badgeForm.tipo === "veicolo"}
      />
      <div className="home-alert-wrapper">
        <Alert alert={props.alert} setAlert={props.setAlert} />
      </div>
    </div>
  );
}

export default Home;
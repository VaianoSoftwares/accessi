/* eslint-disable react-hooks/exhaustive-deps */
// Modules
import React from "react";
import dateFormat from "dateformat";
import env from "react-dotenv";
// Style
import "./index.css";
// Services
import BadgeDataService from "../../services/badge";
// Components
import Navbar from "../accessi-navbar";
import BadgeForm from "../BadgeForm";
import BadgeTable from "../badge-table";
import Clock from "../Clock";
import FormButtons from "../FormButtons";
import OspitiPopup from "../OspitiPopup";
import SerialComponent from "../SerialComponent";
import Alert from "../alert";
// Types
import { User } from "../../types/User";
import { TAlert } from "../../types/TAlert";
import { TableContentElem } from "../../types/TableContentElem";
import { BadgeFormState } from "../../types/BadgeFormState";
import { ArchivioElem } from "../../types/ArchivioElem";
import { Badge } from "../../types/Badge";
import { TipoBadge } from "../../enums/TipoBadge";
import { StatoBadge } from "../../enums/StatoBadge";
import { Nullable } from "../../types/Nullable";
import { TimbraDoc } from "../../types/TimbraDoc";
import { FindBadgeDoc } from "../../types/FindBadgeDoc";
import { ErrResponse, OkResponse } from "../../types/Responses";

type Props = {
  user: User;
  logout: () => Promise<void>;
  token: string;
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>
};

const Home: React.FC<Props> = (props: Props) => {
  const initialBadgeFormState: BadgeFormState = {
    barcode: "",
    descrizione: "",
    tipo: TipoBadge.BADGE,
    assegnazione: "",
    stato: StatoBadge.VALIDO,
    ubicazione: "",
    nome: "",
    cognome: "",
    telefono: "",
    ditta: "",
    tdoc: "",
    ndoc: "",
    pfp: null,
    scadenza: 0,
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

  const [badges, setBadges] = React.useState<TableContentElem[]>([]);
  const [badgeForm, setBadgeForm] = React.useState<BadgeFormState>(initialBadgeFormState);
  //const [archivioForm, setArchivioForm] = React.useState(initialArchivioFormState);
  const [tipiDoc, setTipiDoc] = React.useState<string[]>([]);
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
      timbra({ barcode: scannedValue,
        postazione: props.user.postazione
      });
      setScannedValue("");
    }
  }, [scannedValue]);

  const handleInputChanges = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBadgeForm({ ...badgeForm, [name]: value });
  };

  const handleInputFileChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setBadgeForm({ ...badgeForm, [name]: files![0] });
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
        setBadges(mapArchivioToTableContent(response.data.data));
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
    BadgeDataService.find(mapToFindBadgeDoc(badgeForm))
      .then(response => {
        console.log(response.data);

        const findResponse: Badge[] = response.data.data; 

        if(findResponse.length === 1) {
          const mappedBadge = mapToAutoComplBadge(findResponse[0]);
          setBadgeForm(mappedBadge);
          setPfp(mappedBadge.barcode);
        }
        
        setBadges(mapBadgesToTableContent(findResponse));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const timbra = (data: TimbraDoc) => {
    if(timeoutRunning === false)
      retriveInStrutt();
    BadgeDataService.timbra(data)
      .then(response => {
        console.log(response.data);
        console.log(`timbra - readOnlyForm: ${readOnlyForm}`);

        if(timeoutRunning === true)
          return;

        setTimeoutRunning(true);

        const rowTimbra: ArchivioElem = (response.data as OkResponse).data;
        
        if(readOnlyForm === true) {
          setBadgeForm(mapToAutoComplBadge(rowTimbra));
          setPfp(rowTimbra.barcode);
        }                                    

        const filteredBadges = badges
          .filter(badge => badge.codice !== rowTimbra.barcode);
        const mappedRowTimbra = mapArchivioToTableContent([rowTimbra])[0];
        setBadges([mappedRowTimbra, ...filteredBadges]);                        

        const { msg } = response.data;
        const badgeTable: Nullable<HTMLTableElement> = document.querySelector("table.badge-table");
        const firstRow = badgeTable!.tBodies[0].rows[0];
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
          const { success, msg } = err.response.data as ErrResponse;
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
        if(err.response) {
          const { success, msg } = err.response.data as ErrResponse;
          props.setAlert({ success, msg });
        }
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
        if(err.response) {
          const { success, msg } = err.response.data as ErrResponse;
          props.setAlert({ success, msg });
        }
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
        if(err.response) {
          const { success, msg } = err.response.data as ErrResponse;
          props.setAlert({ success, msg });
        }
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfp();
      });
  };

  const createFormData = () => {
    const formData = new FormData();
    Object.entries(badgeForm)
      .filter(([key, value]) => value != null)
      .map(([key, value]) => value instanceof File ? [key, value as Blob] : [key, value as string])
      .forEach(([key, value]) => formData.append(key as string, value));
    return formData;
  };

  const mapBadgesToTableContent = (data: Badge[]) => {
    return data.map((elem: Badge) => {
      const mappedBadge: TableContentElem = {
        codice: elem.barcode,
        tipo: elem.tipo,
        assegnaz: elem.assegnazione,
        nome: elem.nominativo ? elem.nominativo.nome : "",
        cognome: elem.nominativo ? elem.nominativo.cognome : "",
        ditta: elem.nominativo ? elem.nominativo.ditta : "",
        "data ora consegna": undefined,
        "data ora in": undefined
      };
      return mappedBadge;
    });
  };

  const mapArchivioToTableContent = (data: ArchivioElem[]) => {
    return data.map((elem: ArchivioElem) => {
      const dataEntrata: string = dateFormat(
        new Date(
          new Date(elem.data.entrata).setHours(
            new Date(elem.data.entrata).getHours() - 2
          )
        ),
        "yyyy-mm-dd HH:MM:ss"
      );

      const mappedArchivioElem: TableContentElem = elem.tipo === "chiave" ? {
        codice: elem.barcode,
        tipo: elem.tipo,
        assegnaz: elem.assegnazione,
        nome: elem.nominativo.nome,
        cognome: elem.nominativo.cognome,
        ditta: elem.nominativo.ditta,
        "data ora consegna": dataEntrata,
        "data ora in": undefined
      } : {
        codice: elem.barcode,
        tipo: elem.tipo,
        assegnaz: elem.assegnazione,
        nome: elem.nominativo.nome,
        cognome: elem.nominativo.cognome,
        ditta: elem.nominativo.ditta,
        "data ora consegna": undefined,
        "data ora in": dataEntrata
      };
      return mappedArchivioElem;
    });
  };

  const mapToAutoComplBadge = (badge: Badge | ArchivioElem) => {
    const mappedBadge: BadgeFormState = {
      barcode: badge.barcode,
      descrizione: badge.descrizione,
      tipo: badge.tipo,
      assegnazione: badge.assegnazione,
      stato: badge.stato,
      ubicazione: badge.ubicazione,
      nome: badge.nominativo ? badge.nominativo.nome : "",
      cognome: badge.nominativo ? badge.nominativo.cognome : "",
      telefono: badge.nominativo ? badge.nominativo.telefono : "",
      ditta: badge.nominativo ? badge.nominativo.ditta : "",
      tdoc: badge.nominativo ? badge.nominativo.tdoc : "",
      ndoc: badge.nominativo ? badge.nominativo.ndoc : "",
      pfp: null,
      scadenza: 0,
      targa1: badge.nominativo && badge.nominativo.targhe ? badge.nominativo.targhe[1] : "",
      targa2: badge.nominativo && badge.nominativo.targhe ? badge.nominativo.targhe[2] : "",
      targa3: badge.nominativo && badge.nominativo.targhe ? badge.nominativo.targhe[3] : "",
      targa4: badge.nominativo && badge.nominativo.targhe ? badge.nominativo.targhe[4] : "",
    };

    return mappedBadge;
  };

  const mapToFindBadgeDoc = (badgeForm: BadgeFormState) => {
    const mappedBadge: FindBadgeDoc = {
      barcode: badgeForm.barcode,
      descrizione: badgeForm.descrizione,
      tipo: badgeForm.tipo,
      assegnazione: badgeForm.assegnazione,
      stato: badgeForm.stato,
      ubicazione: badgeForm.ubicazione,
      nome: badgeForm.nome,
      cognome: badgeForm.cognome,
      telefono: badgeForm.telefono,
      ditta: badgeForm.ditta,
      tdoc: badgeForm.tdoc,
      ndoc: badgeForm.ndoc,
      targa1: badgeForm.targa1,
      targa2: badgeForm.targa2,
      targa3: badgeForm.targa3,
      targa4: badgeForm.targa4,
    };

    return mappedBadge;
  };

  const setPfp = (barcode?: string) => {
    const pfp = document.querySelector("img.pfp") as HTMLImageElement;
    pfp.src = barcode
      ? `${env.API_URL as string}/public/foto-profilo/USER_${barcode}.jpg`
      : env.DEFAULT_IMG as string;
    console.log(`setPfp: ${pfp.src}`);
  };

  const refreshPage = () => {
    setBadgeForm(initialBadgeFormState);
    //setArchivioForm(initialArchivioFormState);
    retriveInStrutt();
    setPfp();
  };

  return (
    <div id="home-wrapper">
      <Navbar
        user={props.user}
        logout={props.logout}
        tipoBadge={badgeForm.tipo}
      />
      <br />
      <div className="btn-menu">
        <div className="row">
          <div className="col-sm-3 m-1">
            <button
              onClick={() => setBadgeForm({ ...badgeForm, tipo: TipoBadge.BADGE })}
              className="btn btn-outline-secondary d-inline-block"
            >
              badge
            </button>
            <button
              onClick={() => setBadgeForm({ ...badgeForm, tipo: TipoBadge.VEICOLO })}
              className="btn btn-outline-secondary d-inline-block"
            >
              veicoli
            </button>
            <button
              onClick={() => setBadgeForm({ ...badgeForm, tipo: TipoBadge.CHIAVE })}
              className="btn btn-outline-secondary d-inline-block"
            >
              chiavi
            </button>
          </div>
          <div className="col-sm-2">
            <SerialComponent
              setScannedValue={setScannedValue}
            />
          </div>
        </div>
      </div>
      <div className="submit-form">
        <BadgeForm
          badgeForm={badgeForm}
          handleInputChanges={handleInputChanges}
          handleInputFileChanges={handleInputFileChanges}
          //setPfp={setPfp}
          tipiDoc={tipiDoc}
          readOnlyForm={readOnlyForm}
          admin={props.user.admin}
          token={props.token}
        />
        <FormButtons
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
      <BadgeTable badges={badges} />
      <Clock />
      <OspitiPopup
        isShown={isShown}
        setIsShown={setIsShown}
        tipiDoc={tipiDoc}
        timbra={timbra}
        isVeicolo={badgeForm.tipo === "veicolo"}
        postazione={props.user.postazione}
      />
      <div className="home-alert-wrapper">
        <Alert alert={props.alert} setAlert={props.setAlert} />
      </div>
    </div>
  );
}

export default Home;
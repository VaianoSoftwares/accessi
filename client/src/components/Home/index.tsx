/* eslint-disable react-hooks/exhaustive-deps */
// Modules
import React from "react";
import dateFormat from "dateformat";
//import globals from "../../global-vars";
// Style
import "./index.css";
// Services
import BadgeDataService from "../../services/badge";
// Components
import Navbar from "../accessi-navbar";
import BadgeForm from "../BadgeForm";
import BadgeTable from "../BadgeTable";
import Clock from "../Clock";
import FormButtons from "../FormButtons";
import OspitiPopup from "../OspitiPopup";
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
import { GenericResponse } from "../../types/Responses";
import { Assegnazione } from "../../types/Assegnazione";

type Props = {
  user: User;
  logout: () => Promise<void>;
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
  tipiBadge: TipoBadge[],
  assegnazioni: Assegnazione[],
  tipiDoc: string[],
  statiBadge: StatoBadge[]
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
    scadenza: "",
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
  const [isShown, setIsShown] = React.useState(false);
  const [readOnlyForm, setReadOnlyForm] = React.useState(true);
  const [scannedValue, setScannedValue] = React.useState("");
  const [timeoutRunning, setTimeoutRunning] = React.useState(false);
  const [pfpUrl, setPfpUrl] = React.useState<string>("");
  
  React.useEffect(() => {
    props.setAlert(null);
    retriveInStrutt();
  }, [badgeForm.tipo]);

  React.useEffect(() => {
    //toggleReadonlyInputs(readOnlyForm);
    props.setAlert(null);
    if(readOnlyForm === true) {
      setBadgeForm({ ...initialBadgeFormState, tipo: badgeForm.tipo });
      retriveInStrutt();
      setPfpUrl("");
    }
    console.log(`readOnlyForm: ${readOnlyForm}`);
  }, [readOnlyForm]);

  React.useEffect(() => {
    if(scannedValue) {
      timbra({ barcode: scannedValue,
        postazione: sessionStorage.getItem("postazione") as string,
        tipo: badgeForm.tipo
      });
      setScannedValue("");
    }
  }, [scannedValue]);

  React.useEffect(() => {
    if(badgeForm.pfp) {
      const url = URL.createObjectURL(badgeForm.pfp);
      setPfpUrl(url);
    }
    else {
      setPfpUrl("");
    }
    console.log("pfpUrl: ", pfpUrl);
  }, [badgeForm.pfp]);

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
          const url = getPfpUrlByBarcode(mappedBadge.barcode);
          setPfpUrl(url);
        }
        
        setBadges(mapBadgesToTableContent(findResponse));
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => props.setAlert(null));
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

        const rowTimbra: ArchivioElem = (response.data as GenericResponse).data;
        
        if(readOnlyForm === true) {
          setBadgeForm(mapToAutoComplBadge(rowTimbra));
          const url = getPfpUrlByBarcode(rowTimbra.barcode);
          setPfpUrl(url);
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
            setPfpUrl("");
          }
          /*
          if(msg === "Timbra Esce") {
            setBadges(filteredBadges);
          }
          */
          retriveInStrutt();
          props.setAlert(null);

          setTimeoutRunning(false);
        }, 1000);
      })
      .catch(err => {
        console.log(data);
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data as GenericResponse;
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
        props.setAlert(null);
      })
      .catch(err => {
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data as GenericResponse;
          props.setAlert({ success, msg });
        }
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfpUrl("");
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
        props.setAlert(null);
      })
      .catch(err => {
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data as GenericResponse;
          props.setAlert({ success, msg });
        }
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfpUrl("");
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
        props.setAlert(null);
      })
      .catch(err => {
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data as GenericResponse;
          props.setAlert({ success, msg });
        }
      })
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfpUrl("");
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
        codice: props.user.admin ? elem.barcode : "XXXXX",
        tipo: elem.tipo,
        assegnaz: elem.assegnazione,
        nome: elem.nominativo.nome,
        cognome: elem.nominativo.cognome,
        ditta: elem.nominativo.ditta,
        "data ora consegna": props.user.admin ? dataEntrata : "XXXXX",
        "data ora in": undefined
      } : {
        codice: props.user.admin ? elem.barcode : "XXXXX",
        tipo: elem.tipo,
        assegnaz: elem.assegnazione,
        nome: elem.nominativo.nome,
        cognome: elem.nominativo.cognome,
        ditta: elem.nominativo.ditta,
        "data ora consegna": undefined,
        "data ora in": props.user.admin ? dataEntrata : "XXXXX"
      };
      return mappedArchivioElem;
    });
  };

  const mapToAutoComplBadge = (
    badge: Badge | ArchivioElem
  ): BadgeFormState => ({
    barcode: badge.barcode,
    descrizione: badge.descrizione,
    tipo: badge.tipo,
    assegnazione: badge.assegnazione,
    stato: badge.stato,
    ubicazione: badge.ubicazione,
    nome: (badge.nominativo && badge.nominativo.nome) || "",
    cognome: (badge.nominativo && badge.nominativo.cognome) || "",
    telefono: (badge.nominativo && badge.nominativo.telefono) || "",
    ditta: (badge.nominativo && badge.nominativo.ditta) || "",
    tdoc: (badge.nominativo && badge.nominativo.tdoc) || "",
    ndoc: (badge.nominativo && badge.nominativo.ndoc) || "",
    pfp: null,
    scadenza:
      badge.nominativo && badge.nominativo.scadenza
        ? dateFormat(new Date(badge.nominativo.scadenza), "yyyy-mm-dd")
        : "",
    targa1:
      (badge.nominativo &&
        badge.nominativo.targhe &&
        badge.nominativo.targhe[1]) ||
      "",
    targa2:
      (badge.nominativo &&
        badge.nominativo.targhe &&
        badge.nominativo.targhe[2]) ||
      "",
    targa3:
      (badge.nominativo &&
        badge.nominativo.targhe &&
        badge.nominativo.targhe[3]) ||
      "",
    targa4:
      (badge.nominativo &&
        badge.nominativo.targhe &&
        badge.nominativo.targhe[4]) ||
      "",
  });

  const mapToFindBadgeDoc = (badgeForm: BadgeFormState): FindBadgeDoc => ({
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
  });

  const getPfpUrlByBarcode = (barcode?: string) =>
    barcode
      ? `/api/v1/public/foto-profilo/USER_${barcode}.jpg`
      : "";

  const refreshPage = () => {
    setBadgeForm(initialBadgeFormState);
    //setArchivioForm(initialArchivioFormState);
    retriveInStrutt();
    setPfpUrl("");
    props.setAlert(null);
  };

  return (
    <div id="home-wrapper">
      <Navbar
        user={props.user}
        logout={props.logout}
        badgeForm={badgeForm}
        setBadgeForm={setBadgeForm}
      />
      <br />
      <div className="submit-form">
        <BadgeForm
          badgeForm={badgeForm}
          handleInputChanges={handleInputChanges}
          handleInputFileChanges={handleInputFileChanges}
          tipiBadge={props.tipiBadge}
          assegnazioni={props.assegnazioni}
          tipiDoc={props.tipiDoc}
          statiBadge={props.statiBadge}
          readOnlyForm={readOnlyForm}
          admin={props.user.admin}
          pfpUrl={pfpUrl}
        />
        <FormButtons
          findBadges={findBadges}
          insertBadge={insertBadge}
          updateBadge={updateBadge}
          deleteBadge={deleteBadge}
          refreshPage={refreshPage}
          setIsShown={setIsShown}
          readOnlyForm={readOnlyForm}
          setReadOnlyForm={setReadOnlyForm}
          admin={props.user.admin}
          setScannedValue={setScannedValue}
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
        tipiDoc={props.tipiDoc}
        timbra={timbra}
        isVeicolo={badgeForm.tipo === "veicolo"}
        tipoBadge={badgeForm.tipo}
      />
      <div className="home-alert-wrapper">
        <Alert alert={props.alert} setAlert={props.setAlert} />
      </div>
    </div>
  );
}

export default Home;
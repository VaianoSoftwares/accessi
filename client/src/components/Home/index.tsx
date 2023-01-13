/* eslint-disable react-hooks/exhaustive-deps */
// Modules
import React from "react";

// Style
import "./index.css";

// Services
import BadgeDataService from "../../services/badge";

// Components
import BadgeForm from "../BadgeForm";
import BadgeTable from "../BadgeTable";
import Clock from "../Clock";
import FormButtons from "../FormButtons";
import OspitiPopup from "../OspitiPopup";
import Alert from "../Alert";

// Types
import { TUser } from "../../types/TUser";
import { TAlert } from "../../types/TAlert";
import {
  TInStruttTableContent,
  TTableContent,
} from "../../types/TableContentElem";
import { BadgeFormState } from "../../types/BadgeFormState";
import { TBadgeResp, TBadgeStato, TBadgeTipo, TTDoc } from "../../types/Badge";
import { Nullable } from "../../types/Nullable";
import { TAssegnaz } from "../../types/TAssegnaz";
import { TEvent } from "../../types/TEvent";

// Utils
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import createFormData from "../../utils/createFormData";
import handleInputChanges from "../../utils/handleInputChanges";
import { TInStruttResp, TTimbraResp } from "../../types/Archivio";
import { TableContentMapper } from "../../utils/tableContentMapper";

type Props = {
  user: TUser;
  alert: Nullable<TAlert>;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
  tipiBadge: TBadgeTipo[];
  assegnazioni: TAssegnaz[];
  tipiDoc: TTDoc[];
  statiBadge: TBadgeStato[];
  inStrutt: TInStruttTableContent[];
  setInStrutt: React.Dispatch<React.SetStateAction<TInStruttTableContent[]>>;
  scannedValue: string;
  clearScannedValue: () => void;
  scannerConnected: boolean;
  runScanner: () => Promise<void>;
};

const initialBadgeFormState: BadgeFormState = {
  barcode: "",
  descrizione: "",
  tipo: "BADGE",
  assegnazione: "",
  stato: "VALIDO",
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

const Home: React.FC<Props> = (props: Props) => {
  const [badges, setBadges] = React.useState<TTableContent[]>([]);
  const [badgeForm, setBadgeForm] = React.useState<BadgeFormState>(initialBadgeFormState);
  const [isShown, setIsShown] = React.useState(false);
  const [readOnlyForm, setReadOnlyForm] = React.useState(true);
  const [timeoutRunning, setTimeoutRunning] = React.useState(false);
  const [pfpUrl, setPfpUrl] = React.useState("");

  const { closeAlert, scannedValue, clearScannedValue, setInStrutt, openAlert, inStrutt } = props;

  const handleInputChangesBadge = (e: TEvent) =>
    handleInputChanges(e, badgeForm, setBadgeForm);

  const retriveInStrutt = React.useCallback(() => {
    BadgeDataService.getInStrutt(badgeForm.tipo)
      .then(response => {
        console.log("retriveInStrutt: ", response.data);
        setInStrutt(
          TableContentMapper.mapArchivioToInStruttTableContent(
            response.data.data as TInStruttResp[]
          )
        );
      })
      .catch(err => {
        console.error("retriveInStrutt | error: ", err);
      });
  }, [badgeForm.tipo, setInStrutt])
  
  // const retriveInStrutt = () => {
  //   BadgeDataService.getInStrutt(badgeForm.tipo)
  //     .then(response => {
  //       console.log("retriveInStrutt: ", response.data);
  //       props.setInStrutt(
  //         mapArchivioToInStruttTableContent(
  //           response.data.data as TInStruttResp[]
  //         )
  //       );
  //     })
  //     .catch(err => {
  //       console.error("retriveInStrutt | error: ", err);
  //     });
  // };
  
  const findBadges = () => {
    BadgeDataService.find({ ...badgeForm, pfp: "" })
      .then(response => {
        console.log(response.data);

        const findResponse = response.data.data as TBadgeResp[]; 

        if(findResponse.length === 1) {
          const mappedBadge = TableContentMapper.mapToAutoComplBadge(findResponse[0]);
          setBadgeForm(mappedBadge);
          const url = getPfpUrlByBarcode(mappedBadge.barcode);
          setPfpUrl(url);
        }
        
        setBadges(TableContentMapper.mapBadgesToTableContent(findResponse));
      })
      .catch(err => {
        console.error("findBadges | error: ", err);
      })
      .finally(() => props.closeAlert());
  };

  const timbra = React.useCallback(
    (barcode: string) => {
      if (timeoutRunning === false) retriveInStrutt();
      BadgeDataService.timbra({
        barcode,
        cliente: sessionStorage.getItem("cliente") as string,
        postazione: sessionStorage.getItem("postazione") as string,
      })
        .then((response) => {
          console.log(response.data);
          console.log(`timbra | readOnlyForm: ${readOnlyForm}`);

          if (timeoutRunning === true) return;

          setTimeoutRunning(true);

          const rowTimbra = response.data.data as TTimbraResp;

          if (readOnlyForm === true) {
            setBadgeForm(TableContentMapper.mapToAutoComplBadge(rowTimbra.badge));
            const url = getPfpUrlByBarcode(rowTimbra.timbra.codice);
            setPfpUrl(url);
          }

          const filteredInStrutt = inStrutt.filter(
            (badge) => badge.codice !== rowTimbra.timbra.codice
          );
          const mappedRowTimbra = TableContentMapper.mapArchivioToInStruttTableContent([
            rowTimbra.timbra,
          ])[0];
          setInStrutt([mappedRowTimbra, ...filteredInStrutt]);

          const { msg } = response.data;
          const badgeTable: Nullable<HTMLTableElement> =
            document.querySelector("table.badge-table");
          const firstRow = badgeTable!.tBodies[0].rows[0];
          firstRow.style.backgroundColor =
            msg === "Timbra Entra" ? "green" : "red";

          setTimeout(() => {
            firstRow.style.backgroundColor = "white";
            if (readOnlyForm === true) {
              setBadgeForm(initialBadgeFormState);
              setPfpUrl("");
            }

            retriveInStrutt();
            closeAlert();

            setTimeoutRunning(false);
          }, 1000);
        })
        .catch((err) => axiosErrHandl(err, openAlert, "timbra |"));
    },
    [
      // closeAlert,
      inStrutt,
      // openAlert,
      readOnlyForm,
      retriveInStrutt,
      // setInStrutt,
      timeoutRunning,
    ]
  );

  // const timbra = (barcode: string) => {
  //   if(timeoutRunning === false)
  //     retriveInStrutt();
  //   BadgeDataService.timbra({
  //     barcode,
  //     cliente: sessionStorage.getItem("cliente") as string,
  //     postazione: sessionStorage.getItem("postazione") as string,
  //   })
  //     .then(response => {
  //       console.log(response.data);
  //       console.log(`timbra | readOnlyForm: ${readOnlyForm}`);

  //       if(timeoutRunning === true)
  //         return;

  //       setTimeoutRunning(true);

  //       const rowTimbra = response.data.data as TTimbraResp;
        
  //       if(readOnlyForm === true) {
  //         setBadgeForm(mapToAutoComplBadge(rowTimbra.badge));
  //         const url = getPfpUrlByBarcode(rowTimbra.timbra.codice);
  //         setPfpUrl(url);
  //       }                           

  //       const filteredInStrutt = props.inStrutt
  //         .filter(badge => badge.codice !== rowTimbra.timbra.codice);
  //       const mappedRowTimbra = mapArchivioToInStruttTableContent([
  //         rowTimbra.timbra,
  //       ])[0];
  //       props.setInStrutt([mappedRowTimbra, ...filteredInStrutt]);                        

  //       const { msg } = response.data;
  //       const badgeTable: Nullable<HTMLTableElement> = document.querySelector("table.badge-table");
  //       const firstRow = badgeTable!.tBodies[0].rows[0];
  //       firstRow.style.backgroundColor = msg === "Timbra Entra" ? "green" : "red";

  //       setTimeout(() => {
  //         firstRow.style.backgroundColor = "white";
  //         if(readOnlyForm === true) {
  //           setBadgeForm(initialBadgeFormState);
  //           setPfpUrl("");
  //         }
          
  //         retriveInStrutt();
  //         props.closeAlert();

  //         setTimeoutRunning(false);
  //       }, 1000);
  //     })
  //     .catch(err => axiosErrHandl(err, props.openAlert, "timbra |"));
  // };

  const insertBadge = (form: BadgeFormState) => {
    BadgeDataService.insertBadge(createFormData(form))
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.openAlert({ success, msg });
      })
      .catch(err => axiosErrHandl(err, props.openAlert, "insertBadge |"))
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfpUrl("");
      });
  };

  const updateBadge = (form: BadgeFormState) => {
    const confirmed = window.confirm("Procedere alla modifica del badge?");
		if (!confirmed) return;

    BadgeDataService.updateBadge(createFormData(form))
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.openAlert({ success, msg });
      })
      .catch(err => axiosErrHandl(err, props.openAlert, "updateBadge | "))
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfpUrl("");
      });
  };

  const deleteBadge = (barcode: string) => {
    const confirmed = window.confirm("Procedere alla rimozione del badge?");
		if (!confirmed) return;

    BadgeDataService.deleteBadge(barcode)
      .then(response => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.openAlert({ success, msg });
      })
      .catch(err => axiosErrHandl(err, props.openAlert, "deleteBadge | "))
      .finally(() => {
        setBadgeForm(initialBadgeFormState);
        setPfpUrl("");
      });
  };

  const getPfpUrlByBarcode = (barcode?: string) =>
    barcode
      ? `/api/v1/public/foto-profilo/USER_${barcode}.jpg`
      : "";

  const refreshPage = () => {
    setBadgeForm(initialBadgeFormState);
    retriveInStrutt();
    setPfpUrl("");
    props.closeAlert();
  };

  React.useEffect(() => {
    console.log("useEffect retriveInStrutt");
    closeAlert();
    retriveInStrutt();
  }, [badgeForm.tipo, /*closeAlert,*/ retriveInStrutt]);

  React.useEffect(() => {
    closeAlert();
    if(readOnlyForm === true) {
      setBadgeForm({ ...initialBadgeFormState, tipo: badgeForm.tipo });
      setPfpUrl("");
    }
    console.log("readOnlyForm: ", readOnlyForm);
  }, [readOnlyForm, /*closeAlert,*/ badgeForm.tipo]);

  React.useEffect(() => {
    if(!scannedValue) return;
    console.log("Scanner accessi | scannedValue:", scannedValue);
    timbra(scannedValue);
    clearScannedValue();
  }, [scannedValue, /*clearScannedValue,*/ timbra]);

  React.useEffect(() => {
    if(badgeForm.pfp) {
      const reader = new FileReader();
      reader.readAsDataURL(badgeForm.pfp);
      reader.onload = () => setPfpUrl(reader.result as string);
    }
    else {
      setPfpUrl("");
    }
  }, [badgeForm.pfp]);

  return (
    <div id="home-wrapper">
      <div className="container-fluid mb-1 home-container">
        <div className="row mt-2 justify-content-start align-items-start submit-form">
          <BadgeForm
            badgeForm={badgeForm}
            handleInputChangesBadge={handleInputChangesBadge}
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
            timbra={() => timbra(badgeForm.barcode)}
            insertBadge={() => insertBadge(badgeForm)}
            updateBadge={() => updateBadge(badgeForm)}
            deleteBadge={() => deleteBadge(badgeForm.barcode)}
            refreshPage={refreshPage}
            openPopup={() => setIsShown(true)}
            readOnlyForm={readOnlyForm}
            setReadOnlyForm={() => setReadOnlyForm(!readOnlyForm)}
            admin={props.user.admin}
            runScanner={props.runScanner}
            scannerConnected={props.scannerConnected}
            badges={badges}
            openAlert={props.openAlert}
          />
          <div className="col-4">
            <Clock />
          </div>
          <div className="in-strutt-count">
            <b># in struttura:</b> {props.inStrutt.length}
          </div>
        </div>
        <div className="home-alert-wrapper">
          <Alert alert={props.alert} closeAlert={props.closeAlert} />
        </div>
      </div>
      <OspitiPopup
        isShown={isShown}
        setIsShown={setIsShown}
        tipiDoc={props.tipiDoc}
        insertOsp={insertBadge}
        isVeicolo={badgeForm.tipo === "VEICOLO"}
      />
      <BadgeTable content={props.inStrutt} tableId="badge-table" />
    </div>
  );
}

export default Home;
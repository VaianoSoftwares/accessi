// Modules
import React from "react";
import dateFormat from "dateformat";

// Style
import "./index.css";

// Services
import BadgeDataService from "../../services/badge";

// Components
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
import {
  STATI_BADGE,
  TBadgeResp,
  TBadgeStato,
  TBadgeTipo,
  TDOCS,
  TIPI_BADGE,
  TTDoc,
} from "../../types/Badge";
import { TPostazione } from "../../types/TPostazione";
import { TimbraDoc } from "../../types/TimbraDoc";

// Utils
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TInStruttResp, TTimbraResp } from "../../types/Archivio";
import { TableContentMapper } from "../../utils/tableContentMapper";
import getClienteFromPostazione from "../../utils/getClienteFromPostazione";
import SSHandler from "../../utils/SSHandler";
import { TAssegnazione } from "../../types/TAssegnazione";

type Props = {
  user: TUser;
  alert: TAlert | null;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
  assegnazioni: TAssegnazione[];
  clienti: string[];
  postazioni: TPostazione[];
  scannedValue: string;
  clearScannedValue: () => void;
  scannerConnected: boolean;
  runScanner: () => Promise<void>;
  tipoBadge: TBadgeTipo;
};

export default function Home({
  closeAlert,
  scannedValue,
  clearScannedValue,
  openAlert,
  ...props
}: Props) {
  const barcodeRef = React.useRef<HTMLInputElement>(null);
  const descrizioneRef = React.useRef<HTMLInputElement>(null);
  const tipoRef = React.useRef<HTMLSelectElement>(null);
  const assegnazioneRef = React.useRef<HTMLSelectElement>(null);
  const statoRef = React.useRef<HTMLSelectElement>(null);
  const ubicazioneRef = React.useRef<HTMLInputElement>(null);
  const nomeRef = React.useRef<HTMLInputElement>(null);
  const cognomeRef = React.useRef<HTMLInputElement>(null);
  const telefonoRef = React.useRef<HTMLInputElement>(null);
  const dittaRef = React.useRef<HTMLInputElement>(null);
  const tdocRef = React.useRef<HTMLSelectElement>(null);
  const ndocRef = React.useRef<HTMLInputElement>(null);
  const pfpRef = React.useRef<HTMLInputElement>(null);
  const scadenzaRef = React.useRef<HTMLInputElement>(null);
  const targa1Ref = React.useRef<HTMLInputElement>(null);
  const targa2Ref = React.useRef<HTMLInputElement>(null);
  const targa3Ref = React.useRef<HTMLInputElement>(null);
  const targa4Ref = React.useRef<HTMLInputElement>(null);
  const postazioneRef = React.useRef<HTMLSelectElement>(null);

  const [badges, setBadges] = React.useState<TTableContent[]>([]);
  const [inStrutt, setInStrutt] = React.useState<TInStruttTableContent[]>([]);

  const [isShown, setIsShown] = React.useState(false);
  const [readOnlyForm, setReadOnlyForm] = React.useState(true);
  const timeoutRunning = React.useRef(false);

  const [pfpUrl, setPfpUrl] = React.useState("");

  function createFormData() {
    const formData = new FormData();
    barcodeRef.current?.value &&
      formData.append("barcode", barcodeRef.current.value);
    descrizioneRef.current?.value &&
      formData.append("descrizione", descrizioneRef.current!.value);
    tipoRef.current?.value && formData.append("tipo", tipoRef.current.value);
    assegnazioneRef.current?.value &&
      formData.append("assegnazione", assegnazioneRef.current.value);
    statoRef.current?.value && formData.append("stato", statoRef.current.value);
    ubicazioneRef.current?.value &&
      formData.append("ubicazione", ubicazioneRef.current.value);
    nomeRef.current?.value && formData.append("nome", nomeRef.current.value);
    cognomeRef.current?.value &&
      formData.append("cognome", cognomeRef.current.value);
    telefonoRef.current?.value &&
      formData.append("telefono", telefonoRef.current.value);
    dittaRef.current?.value && formData.append("ditta", dittaRef.current.value);
    tdocRef.current?.value && formData.append("tdoc", tdocRef.current.value);
    ndocRef.current?.value && formData.append("ndoc", ndocRef.current.value);
    pfpRef.current?.files?.item(0) &&
      formData.append("pfp", pfpRef.current.files.item(0)!);
    scadenzaRef.current?.value &&
      formData.append("scadenza", scadenzaRef.current.value);
    targa1Ref.current?.value &&
      formData.append("targa1", targa1Ref.current.value);
    targa2Ref.current?.value &&
      formData.append("targa2", targa2Ref.current.value);
    targa3Ref.current?.value &&
      formData.append("targa3", targa3Ref.current.value);
    targa4Ref.current?.value &&
      formData.append("targa4", targa4Ref.current.value);
    formData.append("postazione", postazioneRef.current!.value);
    return formData;
  }

  function setForm(obj?: BadgeFormState) {
    barcodeRef.current!.value = obj?.barcode || barcodeRef.current!.defaultValue;
    descrizioneRef.current!.value =
      obj?.descrizione || descrizioneRef.current!.defaultValue;
    tipoRef.current!.value = obj?.tipo || tipoRef.current!.options.item(0)!.value;
    assegnazioneRef.current!.value =
      obj?.assegnazione || assegnazioneRef.current!.options.item(0)!.value;
    statoRef.current!.value =
      obj?.stato || statoRef.current!.options.item(0)!.value;
    ubicazioneRef.current!.value =
      obj?.ubicazione || ubicazioneRef.current!.defaultValue;
    nomeRef.current!.value = obj?.nome || nomeRef.current!.defaultValue;
    cognomeRef.current!.value = obj?.cognome || cognomeRef.current!.defaultValue;
    telefonoRef.current!.value =
      obj?.telefono || telefonoRef.current!.defaultValue;
    dittaRef.current!.value = obj?.ditta || dittaRef.current!.defaultValue;
    tdocRef.current!.value =
      obj?.tdoc || tdocRef.current!.options.item(0)!.value;
    ndocRef.current!.value = obj?.ndoc || ndocRef.current!.defaultValue;
    pfpRef.current!.files = null;
    pfpRef.current!.value = pfpRef.current!.defaultValue;
    scadenzaRef.current!.value =
      obj?.scadenza || scadenzaRef.current!.defaultValue;
    targa1Ref.current &&
      (targa1Ref.current.value = obj?.targa1 || targa1Ref.current.defaultValue);
    targa2Ref.current &&
      (targa2Ref.current.value = obj?.targa2 || targa2Ref.current.defaultValue);
    targa3Ref.current &&
      (targa3Ref.current.value = obj?.targa3 || targa3Ref.current.defaultValue);
    targa4Ref.current &&
      (targa4Ref.current.value = obj?.targa4 || targa4Ref.current.defaultValue);
    postazioneRef.current!.value =
      obj?.postazione ||
      postazioneRef.current?.options.item(0)?.value ||
      SSHandler.getPostazione();
  }

  function clearForm() {
    setForm();
  }

  function formToObj(): BadgeFormState {
    return {
      barcode: barcodeRef.current?.value || undefined,
      descrizione: descrizioneRef.current?.value || undefined,
      tipo: tipoRef.current?.value as TBadgeTipo || undefined,
      assegnazione: assegnazioneRef.current?.value || undefined,
      stato: statoRef.current?.value as TBadgeStato || undefined,
      ubicazione: ubicazioneRef.current?.value || undefined,
      nome: nomeRef.current?.value || undefined,
      cognome: cognomeRef.current?.value || undefined,
      telefono: telefonoRef.current?.value || undefined,
      ditta: dittaRef.current?.value || undefined,
      tdoc: tdocRef.current?.value as TTDoc || undefined,
      ndoc: ndocRef.current?.value || undefined,
      pfp: pfpRef.current?.value || undefined,
      scadenza: scadenzaRef.current?.value || undefined,
      targa1: targa1Ref.current?.value || undefined,
      targa2: targa2Ref.current?.value || undefined,
      targa3: targa3Ref.current?.value || undefined,
      targa4: targa4Ref.current?.value || undefined,
      postazione: postazioneRef.current?.value || undefined,
    };
  }

  const retriveInStrutt = React.useCallback(() => {
    const tipiArr: TBadgeTipo[] = [props.tipoBadge, "PROVVISORIO"];
    const reqData = props.user.admin
      ? { tipi: tipiArr }
      : { ...SSHandler.getGuestInStruttReq(), tipi: tipiArr };

    BadgeDataService.getInStrutt(reqData)
      .then((response) => {
        console.log("retriveInStrutt |", response.data);
        setInStrutt(
          TableContentMapper.mapArchivioToInStruttTableContent(
            response.data.data as TInStruttResp[]
          )
        );
      })
      .catch((err) => {
        console.error("retriveInStrutt | error:", err);
      });
  }, [props.tipoBadge, props.user.admin]);

  React.useEffect(retriveInStrutt, [retriveInStrutt]);

  const timbra = React.useCallback(
    (data: TimbraDoc) => {
      if (timeoutRunning.current === false) retriveInStrutt();
      BadgeDataService.timbra(data)
        .then((response) => {
          console.log("timbra | response:", response.data);
          console.log("timbra | readOnlyForm:", readOnlyForm);

          if (timeoutRunning.current === true) return;

          timeoutRunning.current = true;

          const rowTimbra = response.data.data as TTimbraResp;

          if (readOnlyForm === true) {
            setForm(
              TableContentMapper.mapToAutoComplBadge(
                rowTimbra.badge,
                postazioneRef.current!.value
              )
            );
            const url = getPfpUrlByBarcode(rowTimbra.timbra.codice);
            setPfpUrl(url);
          }

          const filteredInStrutt = inStrutt.filter(
            ({ codice }) => codice !== rowTimbra.timbra.codice
          );
          
          const mappedRowTimbra =
            TableContentMapper.mapArchivioToInStruttTableContent([
              rowTimbra.timbra,
            ])[0];
          setInStrutt([mappedRowTimbra, ...filteredInStrutt]);

          const badgeTable = document.getElementById("badge-table");
          const firstRow = badgeTable
            ? (badgeTable as HTMLTableElement).tBodies[0].rows[0]
            : null;
          if (firstRow) {
            switch(response.data.msg) {
              case "Timbra Entra":
                firstRow.style.backgroundColor = "green";
                break;
              case "Timbra Esce":
                firstRow.style.backgroundColor = "red";
                break;
            }
          }

          setTimeout(() => {
            if (firstRow) firstRow.style.backgroundColor = "white";
            if (readOnlyForm === true) {
              clearForm();
              setPfpUrl("");
            }

            retriveInStrutt();
            closeAlert();
          }, 1000);
        })
        .catch((err) => axiosErrHandl(err, openAlert, "timbra |"))
        .finally(() => (timeoutRunning.current = false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // closeAlert,
      inStrutt,
      // openAlert,
      readOnlyForm,
      retriveInStrutt,
    ]
  );

  function findBadges() {
    BadgeDataService.find({ ...formToObj(), pfp: "", postazione: "" })
      .then((response) => {
        console.log("findBadges |", response.data);

        const findResponse = response.data.data as TBadgeResp[];

        if (findResponse.length === 1) {
          setForm(
            TableContentMapper.mapToAutoComplBadge(
              findResponse[0],
              postazioneRef.current!.value
            )
          );

          const url = getPfpUrlByBarcode(findResponse[0].barcode);
          setPfpUrl(url);
        }

        setBadges(TableContentMapper.mapBadgesToTableContent(findResponse));
      })
      .catch((err) => {
        console.error("findBadges | error:", err);
      })
      .finally(() => closeAlert());
  }

  function insertBadge(data: FormData) {
    BadgeDataService.insertBadge(data)
      .then((response) => {
        console.log("insertBadge |", response.data);
        const { success, msg } = response.data;
        openAlert({ success, msg });
      })
      .catch((err) => axiosErrHandl(err, openAlert, "insertBadge |"))
      .finally(() => {
        clearForm();
        setPfpUrl("");
      });
  }

  function updateBadge(data: FormData) {
    const confirmed = window.confirm("Procedere alla modifica del badge?");
    if (!confirmed) return;

    BadgeDataService.updateBadge(data)
      .then((response) => {
        console.log("updateBadge |", response.data);
        const { success, msg } = response.data;
        openAlert({ success, msg });
      })
      .catch((err) => axiosErrHandl(err, openAlert, "updateBadge | "))
      .finally(() => {
        clearForm();
        setPfpUrl("");
      });
  }

  function deleteBadge(barcode: string) {
    const confirmed = window.confirm("Procedere alla rimozione del badge?");
    if (!confirmed) return;

    BadgeDataService.deleteBadge(barcode)
      .then((response) => {
        console.log("deleteBadge |", response.data);
        const { success, msg } = response.data;
        openAlert({ success, msg });
      })
      .catch((err) => axiosErrHandl(err, openAlert, "deleteBadge |"))
      .finally(() => {
        clearForm();
        setPfpUrl("");
      });
  }

  function getPfpUrlByBarcode(barcode?: string) {
    return barcode ? `/api/v1/public/foto-profilo/USER_${barcode}.jpg` : "";
  }

  function updatePfp(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setPfpUrl(reader.result as string);
  }

  function refreshPage() {
    clearForm();
    retriveInStrutt();
    setPfpUrl("");
    closeAlert();
  }

  React.useEffect(() => {
    closeAlert();
    if (readOnlyForm === true) {
      clearForm();
      setPfpUrl("");
    }
    console.log("readOnlyForm:", readOnlyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnlyForm /*closeAlert,*/]);

  React.useEffect(() => {
    if (!scannedValue) return;
    console.log("Scanner accessi | scannedValue:", scannedValue);
    timbra({
      barcode: scannedValue,
      cliente: getClienteFromPostazione(
        postazioneRef.current!.value,
        props.postazioni
      ),
      postazione: postazioneRef.current!.value,
    });
    clearScannedValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedValue, /*clearScannedValue,*/ timbra]);

  return (
    <div id="home-wrapper">
      <div className="container-fluid mb-1 home-container">
        <div className="row mt-2 justify-content-start align-items-start submit-form">
          <div className="col-8 badge-form">
            <div className="row mb-2">
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="postazione"
                  placeholder="postazione"
                  ref={postazioneRef}
                  defaultValue={SSHandler.getPostazione()}
                >
                  {props.postazioni
                    .filter(
                      ({ name }) =>
                        name &&
                        (props.user.admin === true ||
                          (props.user.postazioni &&
                            props.user.postazioni.indexOf(name) >= 0))
                    )
                    .map(({ name }, index) => (
                      <option value={name} key={index}>
                        {name}
                      </option>
                    ))}
                </select>
                <label htmlFor="postazione">postazione</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="barcode"
                  placeholder="barcode"
                  autoComplete="off"
                  ref={barcodeRef}
                  defaultValue=""
                />
                <label htmlFor="barcode">barcode</label>
              </div>
              <div className="form-floating col-sm-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="descrizione"
                  placeholder="descrizione"
                  readOnly={readOnlyForm === true}
                  autoComplete="off"
                  ref={descrizioneRef}
                  defaultValue=""
                />
                <label htmlFor="descrizione">descrizione</label>
              </div>
              <div className="w-100"></div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="tipo"
                  placeholder="tipo"
                  ref={tipoRef}
                  defaultValue={props.tipoBadge}
                >
                  {TIPI_BADGE.map((tipo, index) => (
                    <option
                      value={tipo}
                      key={index}
                      disabled={readOnlyForm === true}
                    >
                      {tipo}
                    </option>
                  ))}
                  <option value="" key="-1" disabled={readOnlyForm === true} />
                </select>
                <label htmlFor="tipo">tipo</label>
              </div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="assegnazione"
                  placeholder="assegnazione"
                  ref={assegnazioneRef}
                  defaultValue=""
                >
                  <option value="" key="-1" disabled={readOnlyForm === true} />
                  {props.assegnazioni
                    .filter(
                      ({ name, badge }) => badge === props.tipoBadge && name
                    )
                    .map(({ name }, index) => (
                      <option
                        value={name}
                        key={index}
                        disabled={readOnlyForm === true}
                      >
                        {name}
                      </option>
                    ))}
                </select>
                <label htmlFor="assegnazione">assegnazione</label>
              </div>
              <div className="w-100" />
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="stato"
                  placeholder="stato"
                  ref={statoRef}
                  defaultValue=""
                >
                  <option value="" key="-1" disabled={readOnlyForm === true} />
                  {STATI_BADGE.map((stato, index) => (
                    <option
                      value={stato}
                      key={index}
                      disabled={readOnlyForm === true}
                    >
                      {stato}
                    </option>
                  ))}
                </select>
                <label htmlFor="stato">stato</label>
              </div>
              <div className="form-floating col-sm-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="ubicazione"
                  placeholder="ubicazione"
                  readOnly={readOnlyForm === true}
                  autoComplete="off"
                  ref={ubicazioneRef}
                  defaultValue=""
                />
                <label htmlFor="ubicazione">ubicazione</label>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-2">
                <div
                  className="pfp-container"
                  style={{
                    backgroundImage: `url(${pfpUrl})`,
                  }}
                />
                <div className="input-group input-group-sm">
                  <input
                    accept="image/*"
                    type="file"
                    className="custom-file-input"
                    id="pfp"
                    disabled={
                      readOnlyForm === true || props.user.admin === false
                    }
                    autoComplete="off"
                    ref={pfpRef}
                    defaultValue=""
                    onChange={(e) => {
                      const file = e.target.files?.item(0);
                      if (file) updatePfp(file);
                      else setPfpUrl("");
                    }}
                  />
                </div>
              </div>
              <div className="col-10">
                <div className="row">
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="nome"
                      placeholder="nome"
                      readOnly={readOnlyForm === true}
                      autoComplete="off"
                      ref={nomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="nome">nome</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="cognome"
                      placeholder="cognome"
                      readOnly={readOnlyForm === true}
                      autoComplete="off"
                      ref={cognomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="cognome">cognome</label>
                  </div>
                  <div className="w-100" />
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="ditta"
                      placeholder="ditta"
                      readOnly={readOnlyForm === true}
                      autoComplete="off"
                      ref={dittaRef}
                      defaultValue=""
                    />
                    <label htmlFor="ditta">ditta</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="telefono"
                      placeholder="telefono"
                      readOnly={readOnlyForm === true}
                      autoComplete="off"
                      ref={telefonoRef}
                      defaultValue=""
                    />
                    <label htmlFor="telefono">telefono</label>
                  </div>
                  <div className="w-100" />
                  <div className="form-floating col-sm-3">
                    <select
                      className="form-select form-select-sm"
                      id="tdoc"
                      placeholder="tipo documento"
                      ref={tdocRef}
                      defaultValue=""
                    >
                      <option
                        value=""
                        key="-1"
                        disabled={readOnlyForm === true}
                      />
                      {TDOCS.filter((tipoDoc) => tipoDoc).map(
                        (tipoDoc, index) => (
                          <option
                            value={tipoDoc}
                            key={index}
                            disabled={readOnlyForm === true}
                          >
                            {tipoDoc}
                          </option>
                        )
                      )}
                    </select>
                    <label htmlFor="tdoc">tipo documento</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="ndoc"
                      placeholder="num documento"
                      readOnly={readOnlyForm === true}
                      autoComplete="off"
                      ref={ndocRef}
                      defaultValue=""
                    />
                    <label htmlFor="ndoc">num documento</label>
                  </div>
                  <div className="w-100" />
                  {props.tipoBadge === "BADGE" ? (
                    <>
                      <div className="form-floating col-sm-3">
                        <input
                          type="date"
                          min={dateFormat(new Date(), "yyyy-mm-dd")}
                          className="form-control form-control-sm"
                          id="scadenza"
                          readOnly={
                            readOnlyForm === true || props.user.admin === false
                          }
                          autoComplete="off"
                          ref={scadenzaRef}
                          defaultValue=""
                        />
                        <label htmlFor="scadenza">scadenza</label>
                      </div>
                      <div className="w-100" />
                    </>
                  ) : (
                    props.tipoBadge === "VEICOLO" && (
                      <>
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa1"
                            placeholder="targa1"
                            readOnly={readOnlyForm === true}
                            autoComplete="off"
                            ref={targa1Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa1">targa1</label>
                        </div>
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa2"
                            placeholder="targa2"
                            readOnly={readOnlyForm === true}
                            ref={targa2Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa2">targa2</label>
                        </div>
                        <div className="w-100" />
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa3"
                            placeholder="targa3"
                            readOnly={readOnlyForm === true}
                            autoComplete="off"
                            ref={targa3Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa3">targa3</label>
                        </div>
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa4"
                            placeholder="targa4"
                            readOnly={readOnlyForm === true}
                            autoComplete="off"
                            ref={targa4Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa4">targa4</label>
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <FormButtons
            findBadges={findBadges}
            timbra={() =>
              timbra({
                barcode: barcodeRef.current!.value,
                cliente: getClienteFromPostazione(
                  postazioneRef.current!.value,
                  props.postazioni
                ),
                postazione: postazioneRef.current!.value,
              })
            }
            insertBadge={() => insertBadge(createFormData())}
            updateBadge={() => updateBadge(createFormData())}
            deleteBadge={() => deleteBadge(barcodeRef.current!.value)}
            refreshPage={refreshPage}
            openPopup={() => setIsShown(true)}
            readOnlyForm={readOnlyForm}
            toggleReadOnlyForm={() => setReadOnlyForm((prev) => !prev)}
            admin={props.user.admin}
            runScanner={props.runScanner}
            scannerConnected={props.scannerConnected}
            badges={badges}
            openAlert={openAlert}
          />
          <div className="col-4">
            <Clock />
          </div>
          <div className="in-strutt-count">
            <b># in struttura:</b> {inStrutt.length}
          </div>
        </div>
        <div className="home-alert-wrapper">
          <Alert alert={props.alert} closeAlert={closeAlert} />
        </div>
      </div>
      <OspitiPopup
        isShown={isShown}
        closePopup={() => setIsShown(false)}
        insertOsp={insertBadge}
        isVeicolo={props.tipoBadge === "VEICOLO"}
      />
      <div className="badge-table-wrapper">
        <BadgeTable
          content={inStrutt}
          tableId="badge-table"
          // omitedParams={["_id", "id"]}
          obfuscatedParams={
            props.user.admin === true ? undefined : ["codice", "entrata"]
          }
        />
      </div>
    </div>
  );
}

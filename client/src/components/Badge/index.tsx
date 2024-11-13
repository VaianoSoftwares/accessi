import { useContext, useEffect, useRef, useState } from "react";
import "./index.css";
import ArchivioDataService from "../../services/archivio";
import NominativiDataService from "../../services/nominativo";
import BadgeTable from "../BadgeTable";
import Clock from "../Clock";
import OspitiPopup from "../OspitiPopup";
import { FormRef, GenericForm } from "../../types";
import useBool from "../../hooks/useBool";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useImage from "../../hooks/useImage";
import useReadonlyForm from "../../hooks/useReadonlyForm";
import { toast } from "react-hot-toast";
import { TPermessi, hasPerm, isAdmin } from "../../types/users";
import { BadgeType, TDOCS } from "../../types/badges";
import { FindBadgesInStruttForm } from "../../types/forms";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import BadgePopup from "../BadgePopup";
import {
  FindBadgeInStruttData,
  TimbraBadgeDoc,
  QueryBadgeInStrutt,
} from "../../types/archivio";
import { CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";
import { timeout } from "../../utils/timeout";
import { Postazione } from "../../types/postazioni";

const TABLE_NAME = "in_strutt_table";
const PROXY = import.meta.env.DEV ? import.meta.env.VITE_PROXY : "";

export default function Badge({
  scannedValue,
  clearScannedValue,
  currPostazione,
  clearCurrPostazione,
  currCliente,
  ...props
}: {
  scannedValue: string;
  clearScannedValue: () => void;
  tipoBadge: BadgeType;
  currPostazione: Postazione | undefined;
  clearCurrPostazione: () => void;
  currCliente: string | undefined;
}) {
  const formRef = useRef<FormRef<FindBadgesInStruttForm>>({
    badge_cod: null,
    assegnazione: null,
    nome: null,
    cognome: null,
    ditta: null,
    ndoc: null,
    tdoc: null,
  });

  const queryClient = useQueryClient();

  const { currentUser } = useContext(CurrentUserContext)!;

  const { handleError } = useError();

  const assegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: async () => {
      try {
        const response = await NominativiDataService.getAssegnazioni();
        console.log("queryAssegnazioni | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const [isPauseShown, setIsPauseShown] = useBool(true);

  const queryInStrutt = useQuery({
    queryKey: [
      "inStrutt",
      {
        postazioniIds: currPostazione
          ? [currPostazione.id]
          : currentUser?.postazioni_ids,
        pausa: isPauseShown,
        cliente: currPostazione?.cliente || currCliente || "",
      },
    ],
    queryFn: async (context) => {
      try {
        const response = await ArchivioDataService.getBadgesInStrutt(
          context.queryKey[1] as FindBadgeInStruttData
        );
        console.log("queryInStrutt | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const mutateInStrutt = useMutation({
    mutationFn: (data: TimbraBadgeDoc) => ArchivioDataService.timbraBadge(data),
    onSuccess: async (response) => {
      console.log("timbra | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      if (timeoutRunning.current === true) return;
      timeoutRunning.current = true;

      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });

      const { row: timbraRow, isEntering } = response.data.result;

      setDeletedRow(isEntering === false ? timbraRow : undefined);

      if (readonlyForm === true) {
        setForm(timbraRow);
        updateImage(timbraRow.codice);
      }

      const badgeTable = document.getElementById(TABLE_NAME);
      if (badgeTable) {
        badgeTable.classList.add(
          isEntering === true ? "added-row" : "removed-row"
        );
      }

      await timeout(1000);

      if (badgeTable) {
        badgeTable.classList.remove("added-row", "removed-row", "updated-row");
      }
      if (readonlyForm === true) {
        refreshPage({ form: true, image: true, refetch: false });
      }

      setDeletedRow(undefined);
      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      if (currentUser?.postazioni_ids.length !== 1) clearCurrPostazione();

      timeoutRunning.current = false;
    },
    onError: async (err) => {
      setDeletedRow(undefined);
      handleError(err, "timbra");
    },
  });

  const mutatePausa = useMutation({
    mutationFn: (data: TimbraBadgeDoc) => ArchivioDataService.pausa(data),
    onSuccess: async (response) => {
      console.log("timbra | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      if (timeoutRunning.current === true) return;
      timeoutRunning.current = true;

      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });

      setDeletedRow(undefined);

      const { in: timbraRow } = response.data.result;

      if (readonlyForm === true) {
        setForm(timbraRow);
        updateImage(timbraRow.codice);
      }

      const badgeTable = document.getElementById(TABLE_NAME);
      if (badgeTable) {
        badgeTable.classList.add("updated-row");
      }

      await timeout(1000);

      if (badgeTable) {
        badgeTable.classList.remove("added-row", "removed-row", "updated-row");
      }
      if (readonlyForm === true) {
        refreshPage({ form: true, image: true, refetch: false });
      }

      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      if (currentUser?.postazioni_ids.length !== 1) clearCurrPostazione();

      timeoutRunning.current = false;
    },
    onError: async (err) => {
      setDeletedRow(undefined);
      handleError(err, "timbra");
    },
  });

  const [deletedRow, setDeletedRow] = useState<QueryBadgeInStrutt>();
  const [isOspPopupShown, setIsOspPopupShown] = useBool(false);
  const [readonlyForm, setReadonlyForm] = useReadonlyForm((condition) => {
    refreshPage({
      image: condition,
      form: condition,
      refetch: false,
    });
  });
  const timeoutRunning = useRef(false);

  const [pfpUrl, { updateImage, setNoImage }] = useImage((data) =>
    data ? `${PROXY}/api/v1/public/uploads/PFP_${data}.jpg` : ""
  );

  function formToObj() {
    const obj: FindBadgesInStruttForm = {};
    Object.entries(formRef.current)
      .filter(([, el]) => el !== null)
      .forEach(
        ([key, el]) => (obj[key as keyof FindBadgesInStruttForm] = el!.value)
      );
    return obj;
  }

  function setForm(obj: GenericForm = {}) {
    Object.entries(formRef.current)
      .filter(([key, el]) => el !== null && key in formRef.current)
      .forEach(([key, el]) => {
        const mappedKey = key as keyof FindBadgesInStruttForm;
        if (el instanceof HTMLInputElement)
          el.value = obj[mappedKey] || el.defaultValue;
        else if (el instanceof HTMLSelectElement && el.options.length > 0)
          el.value = obj[mappedKey] || el.options.item(0)!.value;
      });
  }

  const findInStrutt = useQuery({
    queryKey: ["findInStrutt"],
    queryFn: async () => {
      try {
        const response = await ArchivioDataService.findBadgesInStrutt({
          ...formToObj(),
          postazioniIds: currPostazione
            ? [currPostazione.id]
            : currentUser?.postazioni_ids,
        });
        console.log("findBadges | response:", response);

        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;

        if (result.length === 1) {
          setForm(result[0]);
          updateImage(result[0].codice);
        }

        return result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertArchProv = useMutation({
    mutationFn: (data: FormData) =>
      ArchivioDataService.insertBadgeArchProv(data),
    onSuccess: async (response) => {
      console.log("insertArchProv | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      toast.success("Provvisorio inserito con successo in archivio");
    },
    onError: (err) => handleError(err, "timbra"),
  });

  function refreshPage({ form = true, image = true, refetch = true }) {
    form && setForm();
    image && setNoImage();
    refetch && queryInStrutt.refetch();
  }

  function timbraBtnClickEvent(pausa: boolean, barcodePrefix = "0") {
    if (!currPostazione && currentUser?.postazioni_ids.length !== 1) {
      toast.error("Selezionare la postazione");
      return;
    } else if (!formRef.current.badge_cod?.value) {
      toast.error("Campo Barcode mancante");
      return;
    }

    const timbraData = {
      badge_cod: pausa
        ? formRef.current.badge_cod.value
        : barcodePrefix.concat(formRef.current.badge_cod.value),
      post_id: currPostazione?.id || currentUser!.postazioni_ids[0],
    };

    if (pausa) mutatePausa.mutate(timbraData);
    else mutateInStrutt.mutate(timbraData);
  }

  useEffect(() => {
    if (!scannedValue || !currPostazione) return;

    console.log("Scanner accessi | scannedValue:", scannedValue);
    mutateInStrutt.mutate({
      badge_cod: scannedValue,
      post_id: currPostazione.id,
    });
    clearScannedValue();
  }, [scannedValue]);

  useEffect(() => {
    refreshPage({ form: false, image: false, refetch: true });
  }, [currCliente]);

  return (
    <div id="badge-wrapper" className="no-user-select">
      <div className="container-fluid m-1 badge-container">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col-7 badge-form">
            <div className="row my-1">
              <div className="col-3">
                <div
                  className="pfp-container"
                  style={{
                    backgroundImage: `url(${pfpUrl})`,
                  }}
                />
              </div>
              <div className="col-9">
                <div className="row">
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="codice"
                      placeholder="codice"
                      autoComplete="off"
                      ref={(el) => (formRef.current.badge_cod = el)}
                      onCopy={(e) => {
                        if (isAdmin(currentUser)) return;
                        e.preventDefault();
                        return false;
                      }}
                      onPaste={(e) => {
                        if (isAdmin(currentUser)) return;
                        e.preventDefault();
                        return false;
                      }}
                    />
                    <label htmlFor="barcode">barcode</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <select
                      className="form-select form-select-sm"
                      id="assegnazione"
                      ref={(el) => (formRef.current.assegnazione = el)}
                    >
                      <option key="-1" disabled={readonlyForm === true} />
                      {assegnazioni.isSuccess &&
                        assegnazioni.data.map((assegnazione) => (
                          <option
                            value={assegnazione}
                            key={assegnazione}
                            disabled={readonlyForm === true}
                          >
                            {assegnazione}
                          </option>
                        ))}
                    </select>
                    <label htmlFor="assegnazione">assegnazione</label>
                  </div>
                  <div className="w-100" />
                  <div className="form-floating col-sm">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="nome"
                      placeholder="nome"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={(el) => (formRef.current.nome = el)}
                    />
                    <label htmlFor="nome">nome</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="cognome"
                      placeholder="cognome"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={(el) => (formRef.current.cognome = el)}
                    />
                    <label htmlFor="cognome">cognome</label>
                  </div>
                  <div className="w-100" />
                  <div className="form-floating col-sm-6">
                    <select
                      className="form-select form-select-sm"
                      id="tdoc"
                      ref={(el) => (formRef.current.tdoc = el)}
                    >
                      <option key="-1" disabled={readonlyForm === true} />
                      {TDOCS.filter((tipoDoc) => tipoDoc).map((tipoDoc) => (
                        <option
                          value={tipoDoc}
                          key={tipoDoc}
                          disabled={readonlyForm === true}
                        >
                          {tipoDoc}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="tdoc">tipo documento</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="ndoc"
                      placeholder="num documento"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={(el) => (formRef.current.ndoc = el)}
                    />
                    <label htmlFor="ndoc">num documento</label>
                  </div>
                  <div className="w-100" />
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="ditta"
                      placeholder="ditta"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={(el) => (formRef.current.ditta = el)}
                    />
                    <label htmlFor="ditta">ditta</label>
                  </div>
                  <div className="w-100 mb-4" />
                  <div className="col" />
                  <div className="in-strutt-count col-sm-4">
                    <b># in struttura:</b>{" "}
                    {queryInStrutt.isSuccess ? queryInStrutt.data.length : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-1">
            <div className="form-buttons">
              <div className="row align-items-center justify-content-start g-0">
                {isAdmin(currentUser) === true && (
                  <>
                    <div className="col-auto">
                      <button className="btn btn-success badge-form-btn">
                        <div className="col btn-checkbox-input">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="readonlyFormInput"
                            checked={readonlyForm}
                            onChange={(e) =>
                              setReadonlyForm.setState(e.target.checked)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="readonlyFormInput"
                          >
                            Form
                          </label>
                        </div>
                      </button>
                    </div>
                    <div className="w-100 mt-1" />
                  </>
                )}
                {currPostazione !== undefined &&
                  currPostazione.name !== "PAUSA" && (
                    <>
                      <div className="col">
                        <button
                          onClick={() => timbraBtnClickEvent(false, "0")}
                          className="btn btn-success badge-form-btn"
                        >
                          Entra
                        </button>
                      </div>
                      <div className="w-100 mt-1" />
                      <div className="col">
                        <button
                          onClick={() => timbraBtnClickEvent(false, "1")}
                          className="btn btn-success badge-form-btn"
                        >
                          Esci
                        </button>
                      </div>
                      <div className="w-100 mt-1" />
                      <div className="col">
                        <button
                          onClick={() => timbraBtnClickEvent(true)}
                          className="btn btn-success badge-form-btn"
                        >
                          Pausa
                        </button>
                      </div>
                      <div className="w-100 mt-1" />
                    </>
                  )}
                {isAdmin(currentUser) === true && (
                  <>
                    <div className="col">
                      <BadgePopup
                        content={findInStrutt.data || []}
                        trigger={
                          <button className="btn btn-success badge-form-btn">
                            Cerca
                          </button>
                        }
                        onOpen={() => findInStrutt.refetch()}
                        position="right top"
                      />
                    </div>
                    <div className="w-100 mt-1" />
                  </>
                )}
                {hasPerm(currentUser, TPermessi.canAccessInStruttReport) && (
                  <div className="col">
                    <button
                      onClick={() =>
                        htmlTableToExcel(TABLE_NAME, "in-struttura")
                      }
                      className="btn btn-success badge-form-btn"
                    >
                      Esporta
                    </button>
                  </div>
                )}
                <div className="w-100 mt-1" />
                {hasPerm(currentUser, TPermessi.canMarkProvvisori) && (
                  <div className="col">
                    <button
                      onClick={() => setIsOspPopupShown.setTrue()}
                      className="btn btn-success badge-form-btn"
                    >
                      Provvisori
                    </button>
                  </div>
                )}
                <div className="w-100 mt-1" />
                <div className="col">
                  <button className="btn btn-success badge-form-btn">
                    <div className="col btn-checkbox-input">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isPauseShownInput"
                        checked={isPauseShown}
                        onChange={(e) =>
                          setIsPauseShown.setState(e.target.checked)
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="isPauseShownInput"
                      >
                        Pause
                      </label>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-4">
            <Clock />
          </div>
        </div>
      </div>
      <OspitiPopup
        isShown={isOspPopupShown}
        closePopup={setIsOspPopupShown.setFalse}
        insertOsp={insertArchProv.mutate}
        currPostazione={currPostazione}
      />
      <div className="badge-table-wrapper">
        {queryInStrutt.isSuccess && (
          <BadgeTable
            content={
              deletedRow
                ? [deletedRow, ...queryInStrutt.data]
                : queryInStrutt.data
            }
            tableId={TABLE_NAME}
            omitedParams={["id"]}
            obfuscatedParams={isAdmin(currentUser) ? undefined : ["codice"]}
            timestampParams={["data_in", "data_out"]}
          />
        )}
      </div>
    </div>
  );
}

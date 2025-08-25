import { useContext, useEffect, useRef, useState } from "react";
import "./index.css";
import ArchivioDataService from "../../services/archivio";
import BadgeTable from "../BadgeTable";
import Clock from "../Clock";
import OspitiPopup from "../OspitiPopup";
import useBool from "../../hooks/useBool";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useImage from "../../hooks/useImage";
import { toast } from "react-hot-toast";
import { TPermessi, hasPerm, isAdmin } from "../../types/users";
import { BadgeType } from "../../types/badges";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import {
  FindBadgeInStruttData,
  TimbraBadgeDoc,
  QueryBadgeInStrutt,
} from "../../types/archivio";
import { CurrPostazioneContext, CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";
import { sleep } from "../../utils/timer";
import PopupWithImg from "../PopupWithImg";

const TABLE_NAME = "in_strutt_table";
const PROXY = import.meta.env.DEV ? import.meta.env.VITE_PROXY : "";

export default function Badge({
  scannedValue,
  clearScannedValue,
  ...props
}: {
  scannedValue: string;
  clearScannedValue: () => void;
  tipoBadge: BadgeType;
}) {
  const badgeCodRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { currentUser } = useContext(CurrentUserContext)!;
  const { currCliente, currPostazione, clearCurrPostazione } = useContext(
    CurrPostazioneContext
  )!;

  const { handleError } = useError();

  const timeoutRunning = useRef(false);
  const [deletedRow, setDeletedRow] = useState<QueryBadgeInStrutt>();

  const [isOspPopupShown, setIsOspPopupShown] = useBool(false);
  const [isPauseShown, setIsPauseShown] = useBool(true);

  const [pfpUrl, { updateImage }] = useImage((data) =>
    data ? `${PROXY}/api/v1/public/uploads/PFP_${data}.jpg` : ""
  );
  const [isPopupShown, setIsPopupShown] = useBool(false);
  const [popupBgColor, setPopupBgColor] = useState("green");
  const [popupTxtColor, setPopupTxtColor] = useState(
    "rgba(220, 220, 220, 255)"
  );
  const [popupMsg, setPopupMsg] = useState("");

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

      updateImage(timbraRow.codice);
      setPopupMsg(
        `${timbraRow.nome || ""} ${timbraRow.cognome || ""} ${
          isEntering ? "ENTRATA" : "USCITA"
        }`
      );
      setPopupBgColor(isEntering ? "green" : "red");
      setPopupTxtColor("rgba(220, 220, 220, 255)");
      setIsPopupShown.setTrue();

      const badgeTable = document.getElementById(TABLE_NAME);
      if (badgeTable) {
        badgeTable.classList.add(
          isEntering === true ? "added-row" : "removed-row"
        );
      }

      await sleep(1000);

      if (badgeTable) {
        badgeTable.classList.remove("added-row", "removed-row", "updated-row");
      }
      refreshPage(false);

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

      const { row: timbraRow } = response.data.result;

      updateImage(timbraRow.codice);
      setPopupMsg(`${timbraRow.nome || ""} ${timbraRow.cognome || ""} PAUSA`);
      setPopupBgColor("gold");
      setPopupTxtColor("rgba(40, 40, 40, 255)");
      setIsPopupShown.setTrue();

      const badgeTable = document.getElementById(TABLE_NAME);
      if (badgeTable) {
        badgeTable.classList.add("updated-row");
      }

      await sleep(1000);

      if (badgeTable) {
        badgeTable.classList.remove("added-row", "removed-row", "updated-row");
      }
      refreshPage(false);

      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      if (currentUser?.postazioni_ids.length !== 1) clearCurrPostazione();

      timeoutRunning.current = false;
    },
    onError: async (err) => {
      setDeletedRow(undefined);
      handleError(err, "timbra");
    },
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

  function refreshPage(refetch = true) {
    badgeCodRef.current?.value && (badgeCodRef.current.value = "");
    refetch && queryInStrutt.refetch();
  }

  function timbraBtnClickEvent(pausa: boolean, barcodePrefix = "0") {
    if (!currPostazione && currentUser?.postazioni_ids.length !== 1) {
      toast.error("Selezionare la postazione");
      return;
    } else if (!badgeCodRef.current?.value) {
      toast.error("Campo Barcode mancante");
      return;
    }

    const timbraData = {
      badge_cod: pausa
        ? badgeCodRef.current!.value
        : barcodePrefix.concat(badgeCodRef.current!.value),
      post_id: currPostazione?.id || currentUser!.postazioni_ids[0],
    };

    if (pausa) mutatePausa.mutate(timbraData);
    else mutateInStrutt.mutate(timbraData);
  }

  useEffect(() => {
    if (!scannedValue || isOspPopupShown) {
      clearScannedValue();
      return;
    } else if (!currPostazione) {
      toast.error("Postazione non selezionata");
      clearScannedValue();
      return;
    }

    console.log("Scanner accessi | scannedValue:", scannedValue);
    mutateInStrutt.mutate({
      badge_cod: scannedValue,
      post_id: currPostazione.id,
    });
    clearScannedValue();
  }, [scannedValue, isOspPopupShown]);

  // useEffect(() => {
  //   refreshPage(true);
  // }, [currCliente]);

  return (
    <div id="badge-wrapper" className="no-user-select">
      <div className="container-fluid m-1 badge-container">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col-7 badge-form p-1">
            <div className="row align-items-center">
              <div className="form-floating col-sm-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="codice"
                  placeholder="codice"
                  autoComplete="off"
                  ref={badgeCodRef}
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
                <label htmlFor="codice">barcode</label>
              </div>
              {currPostazione !== undefined &&
                currPostazione.name !== "PAUSA" && (
                  <>
                    <div className="col-sm-1 mx-2">
                      <button
                        onClick={() => timbraBtnClickEvent(false, "0")}
                        className="btn btn-success badge-form-btn"
                      >
                        Entrata
                      </button>
                    </div>
                    <div className="col-sm-1 mx-2">
                      <button
                        onClick={() => timbraBtnClickEvent(false, "1")}
                        className="btn btn-danger badge-form-btn"
                      >
                        Uscita
                      </button>
                    </div>
                    <div className="col-sm-1 mx-2">
                      <button
                        onClick={() => timbraBtnClickEvent(true)}
                        className="btn btn-warning badge-form-btn"
                      >
                        Pausa
                      </button>
                    </div>
                  </>
                )}
              <div className="w-100 mt-4"></div>
              <div className="col-sm-9"></div>
              <div className="col in-strutt-count p-1">
                # In Struttura: {queryInStrutt.data?.length || 0}
              </div>
            </div>
          </div>
          <div className="col-sm-1">
            <div className="form-buttons">
              <div className="row align-items-center justify-content-start g-0">
                {currPostazione !== undefined &&
                  currPostazione.name !== "PAUSA" &&
                  hasPerm(currentUser, TPermessi.canMarkProvvisori) && (
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
        scannedValue={scannedValue}
        clearScannedValue={clearScannedValue}
      />
      <PopupWithImg
        isOpen={isPopupShown}
        onClose={() => setIsPopupShown.setFalse()}
        bgColor={popupBgColor}
        textColor={popupTxtColor}
        textMsg={popupMsg}
        imgSrc={pfpUrl}
      ></PopupWithImg>
      <div className="badge-table-wrapper">
        {queryInStrutt.isSuccess && (
          <BadgeTable
            content={
              deletedRow
                ? [
                    deletedRow,
                    ...queryInStrutt.data.filter(
                      (row) => row.id !== deletedRow.id
                    ),
                  ]
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

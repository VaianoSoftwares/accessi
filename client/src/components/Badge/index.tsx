import { useEffect, useRef, useState } from "react";
import "./index.css";
import BadgeDataService from "../../services/badge";
import ArchivioDataService from "../../services/archivio";
import BadgeTable from "../BadgeTable";
import Clock from "../Clock";
import OspitiPopup from "../OspitiPopup";
import { FormRef, GenericForm } from "../../types";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import useBool from "../../hooks/useBool";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useImage from "../../hooks/useImage";
import useReadonlyForm from "../../hooks/useReadonlyForm";
import { toast } from "react-hot-toast";
import { TLoggedUser, TPermessi, hasPerm, isAdmin } from "../../types/users";
import { BadgeTipo, Postazione, TDOCS } from "../../types/badges";
import { FindInStruttForm } from "../../types/forms";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import BadgePopup from "../BadgePopup";
import {
  FindInStruttData,
  TimbraDoc,
  InsertArchProvData,
  QueryInStrutt,
} from "../../types/archivio";

const TABLE_NAME = "in_strutt_table";

export default function Badge({
  scannedValue,
  clearScannedValue,
  currPostazione,
  user,
  ...props
}: {
  user: TLoggedUser;
  scannedValue: string;
  clearScannedValue: () => void;
  tipoBadge: BadgeTipo;
  currPostazione: Postazione | undefined;
}) {
  const formRef = useRef<FormRef<FindInStruttForm>>({
    codice: null,
    assegnazione: null,
    nome: null,
    cognome: null,
    ditta: null,
    ndoc: null,
    tdoc: null,
  });

  const queryClient = useQueryClient();

  const assegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: async () => {
      try {
        const response = await BadgeDataService.getAssegnazioni();
        console.log("queryAssegnazioni | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        return response.data.result;
      } catch (e) {
        axiosErrHandl(e);
        return [];
      }
    },
  });

  const queryInStrutt = useQuery({
    queryKey: [
      "inStrutt",
      {
        tipi: ["NOMINATIVO", "PROVVISORIO"],
        postazioni: currPostazione ? [currPostazione.id] : user.postazioni,
      },
    ],
    queryFn: async (context) => {
      try {
        const response = await ArchivioDataService.getInStrutt(
          context.queryKey[1] as FindInStruttData
        );
        console.log("queryInStrutt | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        return response.data.result;
      } catch (e) {
        axiosErrHandl(e);
        return [];
      }
    },
  });

  const mutateInStrutt = useMutation({
    mutationFn: (data: TimbraDoc) => ArchivioDataService.timbraBadge(data),
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
      const firstRow = badgeTable
        ? (badgeTable as HTMLTableElement).tBodies[0].rows[0]
        : null;
      if (firstRow) {
        firstRow.style.backgroundColor = isEntering === true ? "green" : "red";
      }

      setTimeout(() => {
        if (firstRow) firstRow.style.backgroundColor = "white";
        if (readonlyForm === true) {
          clearForm();
          setNoImage();
        }

        setDeletedRow(undefined);
      }, 1000);
    },
    onError: async (err) => {
      setDeletedRow(undefined);
      axiosErrHandl(err, "timbra");
    },
    onSettled: async () => (timeoutRunning.current = false),
  });

  const [deletedRow, setDeletedRow] = useState<QueryInStrutt>();
  const [isShown, setIsShown] = useBool(false);
  const [readonlyForm, setReadonlyForm] = useReadonlyForm((condition) => {
    refreshPage({
      image: condition,
      form: condition,
      refetch: false,
    });
    console.log("home | readonlyForm:", condition);
  });
  const timeoutRunning = useRef(false);

  const [pfpUrl, { updateImage, setNoImage }] = useImage((data) =>
    data
      ? `${
          import.meta.env.DEV ? import.meta.env.VITE_PROXY : ""
        }/api/v1/public/foto-profilo/PFP_${data}.jpg`
      : ""
  );

  function formToObj() {
    const obj: FindInStruttForm = {};
    Object.entries(formRef.current)
      .filter(([_, el]) => el !== null)
      .forEach(([key, el]) => (obj[key as keyof FindInStruttForm] = el!.value));
    return obj;
  }

  function setForm(obj: GenericForm = {}) {
    Object.entries(formRef.current)
      .filter(([key, el]) => el !== null && key in formRef.current)
      .forEach(([key, el]) => {
        const mappedKey = key as keyof FindInStruttForm;
        if (el instanceof HTMLInputElement)
          el.value = obj[mappedKey] || el.defaultValue;
        else if (el instanceof HTMLSelectElement && el.options.length > 0)
          el.value = obj[mappedKey] || el.options.item(0)!.value;
      });
  }

  function clearForm() {
    setForm();
  }

  const findInStrutt = useQuery({
    queryKey: ["findInStrutt"],
    queryFn: async () => {
      try {
        const response = await ArchivioDataService.findInStrutt({
          ...formToObj(),
          postazioni: currPostazione ? [currPostazione.id] : user.postazioni,
          tipiBadge: ["NOMINATIVO", "PROVVISORIO"],
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
        axiosErrHandl(e);
        return [];
      }
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertArchProv = useMutation({
    mutationFn: (data: InsertArchProvData) =>
      ArchivioDataService.insertArchProv(data),
    onSuccess: async (response) => {
      console.log("insertArchProv | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      toast.success("Provvisorio inserito con successo in archivio");
    },
    onError: (err) => axiosErrHandl(err, "timbra"),
  });

  function refreshPage({ form = true, image = true, refetch = true }) {
    form && clearForm();
    image && setNoImage();
    refetch && queryInStrutt.refetch();
  }

  useEffect(() => {
    console.log("scannerEvent", scannedValue, currPostazione);
    if (!scannedValue || !currPostazione) return;

    console.log("Scanner accessi | scannedValue:", scannedValue);
    mutateInStrutt.mutate({
      badge: scannedValue,
      postazione: currPostazione.id,
    });
    clearScannedValue();
  }, [scannedValue]);

  return (
    <div id="badge-wrapper">
      <div className="container-fluid m-1 badge-container">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col-6 badge-form">
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
                      ref={(el) => (formRef.current.codice = el)}
                    />
                    <label htmlFor="barcode">barcode</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <select
                      className="form-select form-select-sm"
                      id="assegnazione"
                      placeholder="assegnazione"
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
                      placeholder="tipo documento"
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
                    <b># in struttura:</b> {queryInStrutt.data?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form-buttons">
              <div className="row align-items-center justify-content-start g-0">
                {isAdmin(user) === true && (
                  <>
                    <div className="col-auto">
                      <button
                        onClick={() => setReadonlyForm.setToggle()}
                        className="btn btn-success badge-form-btn"
                      >
                        Form
                      </button>
                    </div>
                    <div className="col-auto mx-2 badge-form-b">
                      <b
                        style={
                          readonlyForm ? { color: "red" } : { color: "green" }
                        }
                      >
                        {readonlyForm && "Non "}
                        {"Attivo"}
                      </b>
                    </div>
                    <div className="w-100 mt-1" />
                  </>
                )}
                <div className="col">
                  <button
                    onClick={() => {
                      if (!currPostazione) {
                        toast.error("Selezionare la postazione");
                        return;
                      } else if (!formRef.current.codice?.value) {
                        toast.error("Campo Barcode mancante");
                        return;
                      }

                      mutateInStrutt.mutate({
                        badge: formRef.current.codice.value,
                        postazione: currPostazione.id,
                      });
                    }}
                    className="btn btn-success badge-form-btn"
                  >
                    Timbra
                  </button>
                </div>
                <div className="w-100 mt-1" />
                {isAdmin(user) === true && (
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
                {hasPerm(user, TPermessi.excel) && (
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
                {hasPerm(user, TPermessi.provvisori) && (
                  <div className="col">
                    <button
                      onClick={() => setIsShown.setTrue()}
                      className="btn btn-success badge-form-btn"
                    >
                      Provvisori
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-4">
            <Clock />
          </div>
        </div>
      </div>
      <OspitiPopup
        isShown={isShown}
        closePopup={setIsShown.setFalse}
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
            timestampParams={["data_in", "data_out"]}
          />
        )}
      </div>
    </div>
  );
}

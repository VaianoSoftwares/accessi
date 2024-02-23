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
    queryFn: () =>
      BadgeDataService.getAssegnazioni().then((response) => {
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryAssegnazioni | response:", response);
        const result = response.data.result;
        return result;
      }),
  });

  const queryInStrutt = useQuery({
    queryKey: [
      "inStrutt",
      {
        tipi: ["NOMINATIVO", "PROVVISORIO"],
        postazioni: currPostazione ? [currPostazione] : user.postazioni,
      },
    ],
    queryFn: (context) =>
      ArchivioDataService.getInStrutt(
        context.queryKey[1] as FindInStruttData
      ).then((response) => {
        console.log("queryInStrutt | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        const result = response.data.result;
        // TableContentMapper.parseDate(result);
        return result;
      }),
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

      const result = response.data.result;

      if (result.isEntrata === false) setDeletedRow(result.rows[0]);
      else setDeletedRow(undefined);

      if (readonlyForm === true) {
        setForm(result.rows[0]);
        updateImage(result.rows[0].codice);
      }

      const badgeTable = document.getElementById(TABLE_NAME);
      const firstRow = badgeTable
        ? (badgeTable as HTMLTableElement).tBodies[0].rows[0]
        : null;
      if (firstRow) {
        if (result.isEntrata === true) firstRow.style.backgroundColor = "green";
        else firstRow.style.backgroundColor = "red";
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
    data ? `/api/v1/public/foto-profilo/USER_${data}.jpg` : ""
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
      const response = await ArchivioDataService.findInStrutt({
        ...formToObj(),
        postazioni: currPostazione ? [currPostazione.id] : user.postazioni,
        tipiBadge: ["NOMINATIVO", "PROVVISORIO"],
      });
      console.log("findBadges | response:", response);

      if (response.data.success === false) {
        throw response.data.error;
      }

      const result = response.data.result;

      if (result.length === 1) {
        setForm(result[0]);

        updateImage(result[0].codice);
      }

      return result;
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
    <div id="home-wrapper">
      <div className="container-fluid m-1 home-container">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col-6 badge-form">
            <div className="row mb-2">
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
            </div>
            <div className="row mt-2">
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
                        className="btn btn-success home-form-btn"
                      >
                        Form
                      </button>
                    </div>
                    <div className="col-auto mx-2 home-form-b">
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
                      if (!formRef.current.codice?.value || !currPostazione) {
                        toast.error("Selezionare la postazione ed un barcode");
                        return;
                      }

                      mutateInStrutt.mutate({
                        badge: formRef.current.codice.value,
                        postazione: currPostazione.id,
                      });
                    }}
                    className="btn btn-success home-form-btn"
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
                          <button className="btn btn-success home-form-btn">
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
                      className="btn btn-success home-form-btn"
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
                      className="btn btn-success home-form-btn"
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
          <div className="in-strutt-count">
            <b># in struttura:</b> {queryInStrutt.data?.length || 0}
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
            omitedParams={["_id", "id"]}
            // obfuscatedParams={
            //   props.user.admin === true ? undefined : ["codice", "data_in"]
            // }
          />
        )}
      </div>
    </div>
  );
}

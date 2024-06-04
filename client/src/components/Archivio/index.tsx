import React, { useContext } from "react";
import ArchivioDataService from "../../services/archivio";
import PostazioniDataService from "../../services/postazioni";
import ClientiDataService from "../../services/clienti";
import NominativiDataService from "../../services/nominativo";
import "./index.css";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import { useQuery } from "@tanstack/react-query";
import { FormRef } from "../../types";
import { TIPI_BADGE } from "../../types/badges";
import { FindArchivioForm } from "../../types/forms";
import { CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";
import createTracciatoFile from "../../utils/createTimbratureFile";
import { Link } from "react-router-dom";

const TABLE_ID = "archivio-table";
const PROXY = import.meta.env.DEV ? import.meta.env.VITE_PROXY : "";
const UPLOADS_DIR = "/api/v1/public/uploads/";

export default function Archivio() {
  const { currentUser } = useContext(CurrentUserContext)!;
  const { handleError } = useError();

  const formRef = React.useRef<FormRef<FindArchivioForm>>({
    badge: null,
    chiave: null,
    tipo: null,
    cliente: null,
    postazione: null,
    assegnazione: null,
    nome: null,
    cognome: null,
    ditta: null,
    data_in_min: null,
    data_in_max: null,
  });

  function formToObj(): FindArchivioForm {
    const obj: FindArchivioForm = {};
    Object.entries(formRef.current)
      .filter(([, el]) => el !== null)
      .forEach(([key, el]) => (obj[key as keyof FindArchivioForm] = el!.value));
    return obj;
  }

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

  const postazioni = useQuery({
    queryKey: ["postazioni", currentUser?.postazioni_ids],
    queryFn: async (context) => {
      try {
        const response = await PostazioniDataService.get({
          ids: context.queryKey[1] as number[],
        });
        console.log("queryPostazioni | response:", response);
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

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: async () => {
      try {
        const response = await ClientiDataService.getAll();
        console.log("queryClienti | response:", response);
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

  const queryArchivio = useQuery({
    queryKey: ["archivio"],
    queryFn: async () => {
      try {
        const response = await ArchivioDataService.getArchivio(formToObj());
        console.log("findArchivio | response: ", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  async function getTracciatoBtnEvHandler() {
    try {
      const reqData = {
        minDate: formRef.current.data_in_min?.value,
        maxDate: formRef.current.data_in_max?.value,
      };

      const response = await ArchivioDataService.getTracciato(reqData);
      if (response.data.success === false) {
        throw response.data.error;
      }

      createTracciatoFile(response.data.result);
    } catch (e) {
      handleError(e);
    }
  }

  function clearForm() {
    Object.values(formRef.current)
      .filter((el) => el !== null)
      .forEach((el) => {
        if (el instanceof HTMLInputElement) el.value = el.defaultValue;
        else if (el instanceof HTMLSelectElement && el.options.length > 0)
          el.value = el.options.item(0)!.value;
      });
  }

  return (
    <div className="archivio-wrapper">
      <div className="container-fluid m-1 archivio-container">
        <div className="row mt-2">
          <div className="col archivio-form">
            <div className="row my-1">
              <div className="form-floating col-sm-3">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataInizio"
                  autoComplete="off"
                  ref={(el) => (formRef.current.data_in_min = el)}
                  defaultValue={dateFormat(new Date(), "yyyy-mm-dd")}
                />
                <label htmlFor="dataInizio">resoconto inizio</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataFine"
                  autoComplete="off"
                  ref={(el) => (formRef.current.data_in_max = el)}
                  defaultValue={dateFormat(
                    new Date().setDate(new Date().getDate() + 1),
                    "yyyy-mm-dd"
                  )}
                  min={formRef.current?.data_in_max?.value}
                />
                <label htmlFor="dataFine">resoconto fine</label>
              </div>
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="cliente"
                  ref={(el) => (formRef.current.cliente = el)}
                >
                  <option key="-1"></option>
                  {clienti.isSuccess &&
                    clienti.data
                      .filter((cliente) =>
                        currentUser?.clienti.includes(cliente)
                      )
                      .map((cliente, index) => (
                        <option value={cliente} key={index}>
                          {cliente}
                        </option>
                      ))}
                </select>
                <label htmlFor="cliente">cliente</label>
              </div>
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="postazione"
                  ref={(el) => (formRef.current.postazione = el)}
                >
                  <option key="-1"></option>
                  {postazioni.isSuccess &&
                    postazioni.data
                      .filter(({ name }) => name)
                      .map(({ id, name }) => (
                        <option value={name} key={id}>
                          {name}
                        </option>
                      ))}
                </select>
                <label htmlFor="postazione">postazione</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="badge"
                  autoComplete="off"
                  ref={(el) => (formRef.current.badge = el)}
                />
                <label htmlFor="badge">badge</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="chiave"
                  autoComplete="off"
                  ref={(el) => (formRef.current.chiave = el)}
                />
                <label htmlFor="chiave">chiave</label>
              </div>
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="assegnazione"
                  ref={(el) => (formRef.current.assegnazione = el)}
                >
                  <option key="-1"></option>
                  {assegnazioni.isSuccess &&
                    assegnazioni.data
                      .filter((a) => a)
                      .map((a) => (
                        <option value={a} key={a}>
                          {a}
                        </option>
                      ))}
                </select>
                <label htmlFor="assegnazione">assegnazione</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="ditta"
                  autoComplete="off"
                  ref={(el) => (formRef.current.ditta = el)}
                />
                <label htmlFor="ditta">ditta</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="nome"
                  autoComplete="off"
                  ref={(el) => (formRef.current.nome = el)}
                />
                <label htmlFor="nome">nome</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cognome"
                  autoComplete="off"
                  ref={(el) => (formRef.current.cognome = el)}
                />
                <label htmlFor="cognome">cognome</label>
              </div>
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="tipo"
                  ref={(el) => (formRef.current.tipo = el)}
                >
                  <option key="-1"></option>
                  {TIPI_BADGE.map((a) => (
                    <option value={a} key={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <label htmlFor="tipo">tipo</label>
              </div>
            </div>
          </div>
          <div className="col-1 archivio-form-btns">
            <div className="row">
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={() => queryArchivio.refetch()}
                >
                  Cerca
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={async () => await getTracciatoBtnEvHandler()}
                >
                  Tracciato
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={() => htmlTableToExcel(TABLE_ID, "archivio")}
                >
                  Excel
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button className="btn btn-success" onClick={() => clearForm()}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="archivio-table-wrapper mt-3">
        {queryArchivio.isSuccess && (
          <BadgeTable
            content={queryArchivio.data}
            tableId={TABLE_ID}
            timestampParams={["data_in", "data_out"]}
            linkParams={["documento"]}
            linkParser={(value: string) => <Link to={`${PROXY}${UPLOADS_DIR}${value}`} >{value}</Link>}
          />
        )}
      </div>
    </div>
  );
}

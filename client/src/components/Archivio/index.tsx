import React from "react";
import { TableContentMapper } from "../../utils/tableContentMapper";
import BadgeDataService from "../../services/badge";
import ArchivioDataService from "../../services/archivio";
import PostazioniDataService from "../../services/postazioni";
import ClientiDataService from "../../services/clienti";
import "./index.css";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import { useQuery } from "@tanstack/react-query";
import { FormRef } from "../../types";
import Clock from "../Clock";
import { TLoggedUser } from "../../types/users";
import { TIPI_BADGE } from "../../types/badges";
import { FindArchivioForm } from "../../types/forms";

const TABLE_ID = "archivio-table";

export default function Archivio({ user }: { user: TLoggedUser }) {
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
    data_in: null,
    data_out: null,
  });

  function formToObj(): FindArchivioForm {
    const obj: FindArchivioForm = {};
    Object.entries(formRef.current)
      .filter(([_, el]) => el !== null)
      .forEach(([key, el]) => (obj[key as keyof FindArchivioForm] = el!.value));
    return obj;
  }

  const assegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: async () => {
      const response = await BadgeDataService.getAssegnazioni();
      console.log("queryAssegnazioni | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      return result;
    },
  });

  const postazioni = useQuery({
    queryKey: ["postazioni", user.postazioni],
    queryFn: async (context) => {
      const response = await PostazioniDataService.get({
        ids: context.queryKey[1] as number[],
      });
      console.log("queryPostazioni | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      return result;
    },
  });

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: async () => {
      const response = await ClientiDataService.getAll();
      console.log("queryClienti | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      return result;
    },
  });

  const queryArchivio = useQuery({
    queryKey: ["archivio"],
    queryFn: async () => {
      const response = await ArchivioDataService.getArchivio(formToObj());
      console.log("findArchivio | response: ", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      TableContentMapper.parseDate(result);
      return result;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  return (
    <div className="archivio-wrapper">
      <div className="container-fluid m-1 archivio-container">
        <div className="row mt-2">
          <div className="col-6 archivio-form">
            <div className="row">
              <div className="form-floating col-sm">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataInizio"
                  autoComplete="off"
                  ref={(el) => (formRef.current.data_in = el)}
                  defaultValue={dateFormat(new Date(), "yyyy-mm-dd")}
                />
                <label htmlFor="dataInizio">resoconto inizio</label>
              </div>
              <div className="form-floating col-sm">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataFine"
                  autoComplete="off"
                  ref={(el) => (formRef.current.data_out = el)}
                  defaultValue={dateFormat(new Date(), "yyyy-mm-dd")}
                  min={formRef.current?.data_out?.value}
                />
                <label htmlFor="dataFine">resoconto fine</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm">
                <select
                  className="form-select form-select-sm"
                  id="cliente"
                  placeholder="cliente"
                  ref={(el) => (formRef.current.cliente = el)}
                >
                  <option key="-1"></option>
                  {clienti.isSuccess &&
                    clienti.data
                      .filter((cliente) => user.clienti.includes(cliente))
                      .map((cliente, index) => (
                        <option value={cliente} key={index}>
                          {cliente}
                        </option>
                      ))}
                </select>
                <label htmlFor="cliente">cliente</label>
              </div>
              <div className="form-floating col-sm">
                <select
                  className="form-select form-select-sm"
                  id="postazione"
                  placeholder="postazione"
                  ref={(el) => (formRef.current.postazione = el)}
                >
                  <option key="-1"></option>
                  {postazioni.isSuccess &&
                    postazioni.data
                      .filter(({ name }) => name)
                      .map(({ name }, index) => (
                        <option value={name} key={index}>
                          {name}
                        </option>
                      ))}
                </select>
                <label htmlFor="postazione">postazione</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="badge"
                  autoComplete="off"
                  ref={(el) => (formRef.current.badge = el)}
                />
                <label htmlFor="badge">badge</label>
              </div>
              <div className="form-floating col-sm">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="chiave"
                  autoComplete="off"
                  ref={(el) => (formRef.current.chiave = el)}
                />
                <label htmlFor="chiave">chiave</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm">
                <select
                  className="form-select form-select-sm"
                  id="assegnazione"
                  placeholder="assegnazione"
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
              <div className="form-floating col-sm">
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
              <div className="form-floating col-sm">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="nome"
                  autoComplete="off"
                  ref={(el) => (formRef.current.nome = el)}
                />
                <label htmlFor="nome">nome</label>
              </div>
              <div className="form-floating col-sm">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cognome"
                  autoComplete="off"
                  ref={(el) => (formRef.current.cognome = el)}
                />
                <label htmlFor="cognome">cognome</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm">
                <select
                  className="form-select form-select-sm"
                  id="tipo"
                  placeholder="tipo"
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
          <div className="col-1">
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
                  onClick={() => htmlTableToExcel(TABLE_ID, "archivio")}
                >
                  Excel
                </button>
              </div>
            </div>
          </div>
          <div className="col">
            <Clock></Clock>
          </div>
        </div>
      </div>
      <div className="archivio-table-wrapper mt-3">
        {queryArchivio.isSuccess && (
          <BadgeTable content={queryArchivio.data} tableId={TABLE_ID} />
        )}
      </div>
    </div>
  );
}

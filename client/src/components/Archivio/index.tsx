import React from "react";
import { TableContentMapper } from "../../utils/tableContentMapper";
import BadgeDataService from "../../services/badge";
import "./index.css";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import { useQuery } from "@tanstack/react-query";
import {
  TAssegnazione,
  TPostazione,
  TArchTableContent,
  TArchivioChiave,
} from "../../types";

type TArchForm = {
  cliente?: string;
  postazione?: string;
  nominativo?: string;
  assegnazione?: string;
  nome?: string;
  cognome?: string;
  chiave?: string;
  descrizione?: string;
  dataInizio?: string;
  dataFine?: string;
};

const TABLE_ID = "archivio-table";

export default function Archivio({
  tipoArchivio,
}: {
  tipoArchivio: "BADGE" | "CHIAVE";
}) {
  const clienteRef = React.useRef<HTMLSelectElement>(null);
  const postazioneRef = React.useRef<HTMLSelectElement>(null);
  const nominativoRef = React.useRef<HTMLInputElement>(null);
  const assegnazioneRef = React.useRef<HTMLSelectElement>(null);
  const nomeRef = React.useRef<HTMLInputElement>(null);
  const cognomeRef = React.useRef<HTMLInputElement>(null);
  const chiaveRef = React.useRef<HTMLInputElement>(null);
  const descrizioneRef = React.useRef<HTMLInputElement>(null);
  const dataInizioRef = React.useRef<HTMLInputElement>(null);
  const dataFineRef = React.useRef<HTMLInputElement>(null);

  function formToObj(): TArchForm {
    return {
      cliente: clienteRef.current?.value || undefined,
      postazione: postazioneRef.current?.value || undefined,
      nominativo: nominativoRef.current?.value || undefined,
      assegnazione: assegnazioneRef.current?.value || undefined,
      nome: nomeRef.current?.value || undefined,
      cognome: cognomeRef.current?.value || undefined,
      chiave: chiaveRef.current?.value || undefined,
      descrizione: descrizioneRef.current?.value || undefined,
      dataInizio: dataInizioRef.current?.value || undefined,
      dataFine: dataFineRef.current?.value || undefined,
    };
  }

  const assegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: async () => {
      const response = await BadgeDataService.getAssegnazioni();
      console.log("queryAssegnazioni | response:", response);
      const result = response.data.data as TAssegnazione[];
      return result;
    },
  });

  const postazioni = useQuery({
    queryKey: ["postazioni"],
    queryFn: async () => {
      const response = await BadgeDataService.getPostazioni();
      console.log("queryPostazioni | response:", response);
      const result = response.data.data as TPostazione[];
      return result;
    },
  });

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: async () => {
      const response = await BadgeDataService.getClienti();
      console.log("queryClienti | response:", response);
      const result = response.data.data as string[];
      return result;
    },
  });

  const queryArchivioBadge = useQuery({
    queryKey: ["archivioBadge", formToObj()],
    queryFn: async (context) => {
      const response = await BadgeDataService.getArchivio(
        context.queryKey[1] as TArchForm
      );
      console.log("findArchivioBadge | response: ", response);
      const result = response.data.data as TArchTableContent[];
      TableContentMapper.parseDate(result);
      return result;
    },
    refetchOnWindowFocus: false,
    enabled: tipoArchivio === "BADGE",
  });

  const queryArchivioChiavi = useQuery({
    queryKey: ["archivioChiavi", formToObj()],
    queryFn: async (context) => {
      const response = await BadgeDataService.getArchivioChiavi(
        context.queryKey[1] as TArchForm
      );
      console.log("findArchivioChiavi | response: ", response);
      const result = response.data.data as TArchivioChiave[];
      TableContentMapper.parseDate(result);
      return result;
    },
    refetchOnWindowFocus: false,
    enabled: tipoArchivio === "CHIAVE",
  });

  // function clearForm() {
  //   clienteRef.current!.value = clienteRef.current!.options!.item(0)!.value;
  //   postazioneRef.current!.value = postazioneRef.current!.options!.item(0)!.value;
  //   nominativoRef.current!.value = nominativoRef.current!.defaultValue;
  //   assegnazioneRef.current!.value = assegnazioneRef.current!.options!.item(0)!.value;
  //   nomeRef.current!.value = nomeRef.current!.defaultValue;
  //   cognomeRef.current!.value = cognomeRef.current!.defaultValue;
  //   chiaveRef.current!.value = chiaveRef.current!.defaultValue;
  //   descrizioneRef.current!.value = descrizioneRef.current!.defaultValue;
  //   dataInizioRef.current!.value = dataInizioRef.current!.defaultValue;
  //   dataFineRef.current!.value = dataFineRef.current!.defaultValue;
  // }

  return (
    <div className="archivio-wrapper">
      <div className="container-fluid mb-5 chiavi-container">
        <div className="row mt-2 archivio-form">
          <div className="col">
            <div className="row">
              <div className="form-floating col-sm-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataInizio"
                  autoComplete="off"
                  ref={dataInizioRef}
                  defaultValue={dateFormat(
                    new Date(new Date().setDate(new Date().getDate() - 1)),
                    "yyyy-mm-dd"
                  )}
                />
                <label htmlFor="dataInizio">resoconto inizio</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataFine"
                  autoComplete="off"
                  ref={dataFineRef}
                  defaultValue={dateFormat(
                    new Date(new Date().setDate(new Date().getDate() + 1)),
                    "yyyy-mm-dd"
                  )}
                  min={dataInizioRef.current?.value}
                />
                <label htmlFor="dataFine">resoconto fine</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="cliente"
                  placeholder="cliente"
                  ref={clienteRef}
                  defaultValue=""
                >
                  <option value="" key="-1"></option>
                  {clienti.data
                    ?.filter((cliente) => cliente)
                    .map((cliente, index) => (
                      <option value={cliente} key={index}>
                        {cliente}
                      </option>
                    ))}
                </select>
                <label htmlFor="cliente">cliente</label>
              </div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="postazione"
                  placeholder="postazione"
                  ref={postazioneRef}
                  defaultValue=""
                >
                  <option value="" key="-1"></option>
                  {postazioni.data
                    ?.filter(({ name }) => name)
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
                  id="nominativo"
                  autoComplete="off"
                  ref={nominativoRef}
                  defaultValue=""
                />
                <label htmlFor="nominativo">badge</label>
              </div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="assegnazione"
                  placeholder="assegnazione"
                  ref={assegnazioneRef}
                  defaultValue=""
                >
                  <option value="" key="-1"></option>
                  {assegnazioni.data
                    ?.filter(({ name }) => name)
                    .map(({ name }, index) => (
                      <option value={name} key={index}>
                        {name}
                      </option>
                    ))}
                </select>
                <label htmlFor="assegnazione">assegnazione</label>
              </div>
              <div className="w-100 mb-1" />
              {tipoArchivio === "CHIAVE" && (
                <>
                  <div className="form-floating col-sm-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="nome"
                      autoComplete="off"
                      ref={nomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="nome">nome</label>
                  </div>
                  <div className="form-floating col-sm-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="cognome"
                      autoComplete="off"
                      ref={cognomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="cognome">cognome</label>
                  </div>
                  <div className="w-100 mb-1" />
                  <div className="form-floating col-sm-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="chiave"
                      autoComplete="off"
                      ref={chiaveRef}
                      defaultValue=""
                    />
                    <label htmlFor="chiave">chiave</label>
                  </div>
                  <div className="form-floating col-sm-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="descrizione"
                      autoComplete="off"
                      ref={descrizioneRef}
                      defaultValue=""
                    />
                    <label htmlFor="descrizione">descrizione</label>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col-1">
            <div className="row">
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={() =>
                    tipoArchivio === "BADGE"
                      ? queryArchivioBadge.refetch()
                      : queryArchivioChiavi.refetch()
                  }
                >
                  Cerca
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={() => htmlTableToExcel(TABLE_ID)}
                >
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="archivio-table-wrapper">
        {tipoArchivio === "BADGE" && queryArchivioBadge.isSuccess && (
          <BadgeTable content={queryArchivioBadge.data} tableId={TABLE_ID} />
        )}
        {tipoArchivio === "CHIAVE" && queryArchivioChiavi.isSuccess && (
          <BadgeTable content={queryArchivioChiavi.data} tableId={TABLE_ID} />
        )}
      </div>
    </div>
  );
}

import React, { useContext } from "react";
import ArchivioDataService from "../../services/archivio";
import PostazioniDataService from "../../services/postazioni";
import ClientiDataService from "../../services/clienti";
import NominativiDataService from "../../services/nominativo";
import "./index.css";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormRef } from "../../types";
import { TIPI_BADGE } from "../../types/badges";
import { FindArchivioForm, FindArchivioFullForm } from "../../types/forms";
import { CurrentUserContext, CurrPostazioneContext } from "../RootProvider";
import useError from "../../hooks/useError";
import createTracciatoFile from "../../utils/createTimbratureFile";
import { Link } from "react-router-dom";
import { UpdateArchivioData } from "../../types/archivio";
import { TPermessi, hasPerm } from "../../types/users";
import toast from "react-hot-toast";

const TABLE_ID = "archivio-table";
const PROXY = import.meta.env.DEV ? import.meta.env.VITE_PROXY : "";
const UPLOADS_DIR = "/api/v1/public/uploads/";

export default function Archivio() {
  const { currentUser } = useContext(CurrentUserContext)!;
  const { currCliente, currPostazione } = useContext(CurrPostazioneContext)!;

  const { handleError } = useError();

  const queryClient = useQueryClient();

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
    date_min: null,
    date_max: null,
    date_new: null,
    id: null,
    zuc_cod: null,
    in_out: null,
    pausa: null,
  });

  function formToObj(): FindArchivioFullForm {
    const obj: FindArchivioFullForm = {};
    Object.entries(formRef.current)
      .filter(([, el]) => el !== null)
      .forEach(([key, el]) => {
        switch (key) {
          case "cliente":
            obj[key] = el?.value || currCliente;
            break;
          case "postazione":
            obj[key] = el?.value || currPostazione?.name;
            break;
          case "post_ids":
            obj[key] = currentUser?.postazioni.map((p) => p.id);
            break;
          default:
            obj[key as keyof Omit<FindArchivioFullForm, "post_ids">] =
              el?.value;
        }
      });
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
    queryKey: ["postazioni", currentUser?.postazioni.map((p) => p.id)],
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

  const updateArchivio = useMutation({
    mutationFn: (data: UpdateArchivioData) =>
      ArchivioDataService.updateArchivio(data),
    onSuccess: async (response) => {
      console.log("updateArchivio | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      await queryClient.invalidateQueries({ queryKey: ["archivio"] });
      toast.success("Archivio aggiornato con successo");
    },
    onError: (e) => handleError(e, "updateArchivio"),
  });

  async function getTracciatoBtnEvHandler() {
    try {
      const reqData = {
        minDate: formRef.current.date_min?.value,
        maxDate: formRef.current.date_max?.value,
        zuc_cod: formRef.current.zuc_cod?.value,
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
                  ref={(el) => (formRef.current.date_min = el)}
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
                  ref={(el) => (formRef.current.date_max = el)}
                  defaultValue={dateFormat(
                    new Date().setDate(new Date().getDate() + 1),
                    "yyyy-mm-dd"
                  )}
                  // min={formRef.current?.date_max?.value}
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
                        currentUser?.postazioni
                          .map((p) => p.cliente)
                          .includes(cliente)
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
                      .map(({ id, cliente, name }) => (
                        <option value={name} key={id}>
                          {cliente} - {name}
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
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="zuc_cod"
                  autoComplete="off"
                  ref={(el) => (formRef.current.zuc_cod = el)}
                />
                <label htmlFor="zuc_cod">cod zucchetti</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="mark_type"
                  ref={(el) => (formRef.current.in_out = el)}
                >
                  <option key="-1"></option>
                  {["I", "O"].map((a) => (
                    <option value={a} key={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <label htmlFor="mark_type">I/O</label>
              </div>
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="mark_type"
                  ref={(el) => (formRef.current.pausa = el)}
                >
                  <option key="-1"></option>
                  {["SI", "NO"].map((a) => (
                    <option value={a} key={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <label htmlFor="mark_type">pausa</label>
              </div>
              {hasPerm(currentUser, TPermessi.canEditArchivio) && (
                <>
                  <div className="w-100 mb-1" />
                  <hr></hr>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="arch_id"
                      autoComplete="off"
                      ref={(el) => (formRef.current.id = el)}
                    />
                    <label htmlFor="arch_id">archivio ID</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm"
                      id="date_new"
                      autoComplete="off"
                      ref={(el) => (formRef.current.date_new = el)}
                    />
                    <label htmlFor="date_new">nuova data</label>
                  </div>
                </>
              )}
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
              {hasPerm(currentUser, TPermessi.canEditArchivio) && (
                <>
                  <div className="w-100 mb-1" />
                  <div className="col">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        const archId = formRef.current.id?.value;
                        if (!archId) {
                          toast.error("Campo Archivio ID mancante");
                          return;
                        }
                        updateArchivio.mutate({
                          id: archId,
                          created_at: formRef.current.date_new?.value,
                        });
                      }}
                    >
                      Modifica Data
                    </button>
                  </div>
                </>
              )}
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    clearForm();
                    await queryClient.invalidateQueries({
                      queryKey: ["archivio"],
                    });
                    queryArchivio.remove();
                  }}
                >
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
            timestampParams={["created_at"]}
            linkParams={["documento"]}
            renamedParams={
              new Map([
                ["created_at", "data"],
                ["in_out", "ingresso/uscita"],
              ])
            }
            linkParser={(value: string) => (
              <Link
                to={`${PROXY}${UPLOADS_DIR}${value}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {value}
              </Link>
            )}
            omitedParams={["post_id", "mark_type"]}
          />
        )}
      </div>
    </div>
  );
}

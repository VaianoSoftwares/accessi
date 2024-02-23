import { useRef, useState } from "react";
import "./index.css";
import ClientiDataService from "../../services/clienti";
import PostazioniDataService from "../../services/postazioni";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertPostazioneData } from "../../types/badges";

export default function Postazioni() {
  const queryClient = useQueryClient();

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: () =>
      ClientiDataService.getAll().then((response) => {
        console.log("queryClienti | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        const result = response.data.result;
        return result;
      }),
  });

  const queryPostazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: () =>
      PostazioniDataService.getAll().then((response) => {
        console.log("queryPostazioni | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        const result = response.data.result;
        return result;
      }),
  });

  const addPostazione = useMutation({
    mutationFn: (data: InsertPostazioneData) =>
      PostazioniDataService.insert(data),
    onSuccess: async (response) => {
      console.log("addPostazione | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["postazioni"] });
      nameRef.current!.value = nameRef.current!.defaultValue;
    },
    onError: async (err) => axiosErrHandl(err, "addPostazione"),
  });

  const deletePostazione = useMutation({
    mutationFn: (data: number) => PostazioniDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deletePostazione | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["postazioni"] });
    },
    onError: async (err) => axiosErrHandl(err, "deletePostazione"),
  });

  const [currTCliente, setCurrTCliente] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="container-fluid">
      <h2>Menù Postazioni</h2>
      <div className="row mb-1">
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="cliente"
            placeholder="cliente"
            onChange={(e) => setCurrTCliente(e.target.value)}
            defaultValue=""
          >
            <option value="" key="-1">
              Seleziona un cliente
            </option>
            {clienti.data?.map((cliente, index) => (
              <option value={cliente} key={index}>
                {cliente}
              </option>
            ))}
          </select>
          <label htmlFor="cliente">cliente</label>
        </div>
        <div className="form-floating col-sm-2">
          <input
            type="text"
            className="form-control form-control-sm"
            id="postazione"
            placeholder="postazione"
            autoComplete="off"
            ref={nameRef}
            defaultValue=""
          />
          <label htmlFor="postazione">postazione</label>
        </div>
        <div className="col-sm-3 align-self-center">
          <button
            onClick={() =>
              addPostazione.mutate({
                cliente: currTCliente,
                name: nameRef.current!.value,
              })
            }
            className="btn btn-success"
          >
            Aggiungi
          </button>
        </div>
      </div>
      <div className="w-100 mb-3" />
      <div className="list-group list-postazioni col-sm-3 postazioni-list mx-3">
        {queryPostazioni.data
          ?.filter(({ name, cliente }) => name && cliente === currTCliente)
          .map(({ id, name }) => (
            <div
              id={`list-postazioni-entry-${id}`}
              className="list-group-item"
              key={id}
            >
              <div className="row justify-content-between align-items-center">
                <div className="col-10">
                  <p>{name}</p>
                </div>
                <div className="col">
                  <button
                    value={id}
                    type="button"
                    className="close btn-del-postazioni"
                    aria-label="Close"
                    onClick={(e) => {
                      const confirmed = confirm(
                        "Procede all'eliminazione della postazione?"
                      );
                      if (!confirmed) return;
                      deletePostazione.mutate(
                        Number.parseInt(e.currentTarget.value)
                      );
                    }}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

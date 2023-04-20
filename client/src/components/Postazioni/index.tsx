import { useRef, useState } from "react";

import "./index.css";

import BadgeDataService from "../../services/badge";

import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TPostazione } from "../../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Postazioni() {
  const queryClient = useQueryClient();

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: () =>
      BadgeDataService.getClienti().then((response) => {
        console.log("queryClienti | response:", response);
        const result = response.data.data as string[];
        return result;
      }),
  });

  const queryPostazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: () =>
      BadgeDataService.getPostazioni().then((response) => {
        console.log("queryPostazioni | response:", response);
        const result = response.data.data as TPostazione[];
        return result;
      }),
  });

  const addPostazione = useMutation({
    mutationFn: BadgeDataService.insertPostazione,
    onSuccess: async (response) => {
      console.log("addPostazione | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["postazioni"] });
      nameRef.current!.value = nameRef.current!.defaultValue;
    },
    onError: async (err) => axiosErrHandl(err, "addPostazione"),
  });

  const deletePostazione = useMutation({
    mutationFn: BadgeDataService.deletePostazione,
    onSuccess: async (response) => {
      console.log("deletePostazione | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["postazioni"] });
    },
    onError: async (err) => axiosErrHandl(err, "deletePostazione"),
  });

  const [currTCliente, setCurrTCliente] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="row">
        <h2>Menù Postazioni</h2>
        <div className="w-100 mb-2"></div>
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="cliente"
            placeholder="cliente"
            onChange={(e) => setCurrTCliente(e.target.value)}
            defaultValue=""
          >
            <option value="" key="-1" />
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
        <div className="col-sm-3 mb-1">
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
        <div className="w-100 mb-3"></div>
        <div className="list-group list-postazioni col-sm-3 postazioni-list mx-3">
          {queryPostazioni.data
            ?.filter(({ name, cliente }) => name && cliente === currTCliente)
            .map(({ _id, name }) => (
              <div
                id={`list-postazioni-entry-${_id}`}
                className="list-group-item"
                key={_id}
              >
                <div className="row justify-content-between align-items-center">
                  <div className="col-10">
                    <p>{name}</p>
                  </div>
                  <div className="col">
                    <button
                      value={_id}
                      type="button"
                      className="close btn-del-postazioni"
                      aria-label="Close"
                      onClick={(e) => {
                        const confirmed = confirm(
                          "Procede all'eliminazione della postazione?"
                        );
                        if (!confirmed) return;

                        deletePostazione.mutate({
                          _id: e.currentTarget.value,
                        });
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
    </>
  );
}

import React, { useRef, useState } from "react";
import "./index.css";
import BadgeDataService from "../../services/badge";
import { TAssegnazione } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeType, TIPI_BADGE } from "../../types/badges";
import useError from "../../hooks/useError";

export default function Assegnazioni() {
  const queryClient = useQueryClient();
  const { handleError } = useError();

  const queryAssegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: () =>
      BadgeDataService._getAssegnazioni().then((response) => {
        console.log("queryAssegnazioni | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        const result = response.data.result;
        return result;
      }),
  });

  const addAssegnazione = useMutation({
    mutationFn: (data: TAssegnazione) =>
      BadgeDataService.insertAssegnazione(data),
    onSuccess: async (response) => {
      console.log("addAssegnazione | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["assegnazioni"] });
      nameRef.current!.value = nameRef.current!.defaultValue;
    },
    onError: async (err) => handleError(err, "addAssegnazione"),
  });

  const deleteAssegnazione = useMutation({
    mutationFn: (data: TAssegnazione) =>
      BadgeDataService.deleteAssegnazione(data),
    onSuccess: async (response) => {
      console.log("deleteAssegnazione | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["assegnazioni"] });
    },
    onError: async (err) => handleError(err, "deleteAssegnazione"),
  });

  const [currTBadge, setCurrTBadge] = useState<BadgeType>(BadgeType.NOMINATIVO);
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="container-fluid">
      <h2>Menù Assegnazioni</h2>
      <div className="row mb-3">
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="tipo-badge"
            onChange={(e) => setCurrTBadge(e.target.value as BadgeType)}
            defaultValue={BadgeType.NOMINATIVO}
          >
            {TIPI_BADGE.map((tipo, index) => (
              <option value={tipo} key={index}>
                {tipo}
              </option>
            ))}
          </select>
          <label htmlFor="tipo-badge">tipo badge</label>
        </div>
        <div className="form-floating col-sm-2">
          <input
            type="text"
            className="form-control form-control-sm"
            id="assegnazione"
            placeholder="assegnazione"
            autoComplete="off"
            ref={nameRef}
            defaultValue=""
          />
          <label htmlFor="assegnazione">assegnazione</label>
        </div>
        <div className="col-sm-3 align-self-center">
          <button
            onClick={() =>
              addAssegnazione.mutate({
                badge: currTBadge,
                name: nameRef.current!.value.toUpperCase(),
              })
            }
            className="btn btn-success"
          >
            Aggiungi
          </button>
        </div>
      </div>
      <div className="list-group list-assegnaz col-sm-3 assegnaz-list mx-3">
        {queryAssegnazioni.data
          ?.filter(({ name, badge }) => name && badge === currTBadge)
          .map(({ name }, index) => (
            <div
              id={`list-assegnaz-entry-${index}`}
              className="list-group-item"
              key={index}
            >
              <div className="row justify-content-between align-items-center">
                <div className="col-10">
                  <p>{name}</p>
                </div>
                <div className="col">
                  <button
                    value={name}
                    type="button"
                    className="close btn-del-assegnaz"
                    aria-label="Close"
                    onClick={(e) => {
                      const confirmed = confirm(
                        "Procede all'eliminazione della assegnazione?"
                      );
                      if (!confirmed) return;

                      deleteAssegnazione.mutate({
                        badge: currTBadge,
                        name: e.currentTarget.value,
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
  );
}

import React from "react";

import "./index.css";

import BadgeDataService from "../../services/badge";

import { TAlert } from "../../types/TAlert";

import Alert from "../Alert";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TPostazione } from "../../types/TPostazione";

type Props = {
  alert: TAlert | null;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
  clienti: string[];
  postazioni: TPostazione[];
  addPostazione: (postazione: TPostazione) => void;
  removePostazione: (name: string) => void;
};

export default function Postazioni(props: Props) {
  const [currTCliente, setCurrTCliente] = React.useState("");
  const nameRef = React.useRef<HTMLInputElement>(null);

  function addPostazione(postazione: TPostazione) {
    BadgeDataService.insertPostazione(postazione)
      .then(() => {
        props.addPostazione(postazione);
        nameRef.current!.value = nameRef.current!.defaultValue;
      })
      .catch((err) => axiosErrHandl(err, props.openAlert, "addPostazione |"));
  }

  function deletePostazione(postazione: TPostazione) {
    BadgeDataService.deletePostazione(postazione)
      .then(() => {
        props.removePostazione(postazione.name);
      })
      .catch((err) =>
        axiosErrHandl(err, props.openAlert, "deletePostazione |")
      );
  }

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
            {props.clienti.map((cliente, index) => (
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
              addPostazione({
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
          {props.postazioni
            .filter(({ name, cliente }) => name && cliente === currTCliente)
            .map(({ name }, index) => (
              <div
                id={`list-postazioni-entry-${index}`}
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
                      className="close btn-del-postazioni"
                      aria-label="Close"
                      onClick={(e) =>
                        deletePostazione({
                          cliente: currTCliente,
                          name: e.currentTarget.value,
                        })
                      }
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <Alert alert={props.alert} closeAlert={props.closeAlert} />
    </>
  );
}

import React from "react";

import "./index.css";

import BadgeDataService from "../../services/badge";

import { TAlert } from "../../types/TAlert";
import { TAssegnazione } from "../../types/TAssegnazione";
import { TBadgeTipo, TIPI_BADGE } from "../../types/Badge";

import Alert from "../Alert";
import { axiosErrHandl } from "../../utils/axiosErrHandl";

type Props = {
  alert: TAlert | null;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
  assegnazioni: TAssegnazione[];
  addAssegnazione: (assegnazione: TAssegnazione) => void;
  removeAssegnazione: (name: string) => void;
};

export default function Assegnaz(props: Props) {
  const [currTBadge, setCurrTBadge] = React.useState<TBadgeTipo>("BADGE");
  const nameRef = React.useRef<HTMLInputElement>(null);

  function addAssegnazione(assegnazione: TAssegnazione) {
    BadgeDataService.insertAssegnazione(assegnazione)
      .then(() => {
        props.addAssegnazione(assegnazione);
        nameRef.current!.value = nameRef.current!.defaultValue;
      })
      .catch((err) => axiosErrHandl(err, props.openAlert, "addAssegnazione |"));
  }

  function deleteAssegnazione(assegnazione: TAssegnazione) {
    BadgeDataService.deleteAssegnazione(assegnazione)
      .then(() => {
        props.removeAssegnazione(assegnazione.name);
      })
      .catch((err) =>
        axiosErrHandl(err, props.openAlert, "deleteAssegnazione |")
      );
  }

  return (
    <>
      <div className="row">
        <h2>Menù Assegnazioni</h2>
        <div className="w-100 mb-2"></div>
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="tipo-badge"
            placeholder="tipo badge"
            onChange={(e) => setCurrTBadge(e.target.value as TBadgeTipo)}
            defaultValue="BADGE"
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
        <div className="col-sm-3 mb-1">
          <button
            onClick={() =>
              addAssegnazione({
                badge: currTBadge,
                name: nameRef.current!.value,
              })
            }
            className="btn btn-success"
          >
            Aggiungi
          </button>
        </div>
        <div className="w-100 mb-3"></div>
        <div className="list-group list-assegnaz col-sm-3 assegnaz-list mx-3">
          {props.assegnazioni
            .filter(({ name, badge }) => name && badge === currTBadge)
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
                      onClick={(e) =>
                        deleteAssegnazione({
                          badge: currTBadge,
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

import React from "react";

import BadgeDataService from "../../services/badge";

import { TipoBadge } from "../../enums/TipoBadge";
import { AssegnazFormState } from "../../types/AssegnazFormState";
import { Nullable } from "../../types/Nullable";
import { TAlert } from "../../types/TAlert";
import { Assegnazione } from "../../types/Assegnazione";
import removeElemFromArr from "../../utils/removeElemFromArr";

import Alert from "../alert";

type AssegnazProps = {
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
  tipiBadge: TipoBadge[];
  assegnazioni: Assegnazione[];
  setAssegnazioni: React.Dispatch<React.SetStateAction<Assegnazione[]>>;
};

type AssegnazState = {
  assegnazForm: AssegnazFormState
};

export default class Assegnaz extends React.Component<AssegnazProps, AssegnazState> {

  static initialAssegnazFormState: AssegnazFormState = {
    tipoBadge: TipoBadge.BADGE,
    assegnazione: ""
  };

  constructor(props: AssegnazProps) {
    super(props);
    this.state = {
      assegnazForm: Assegnaz.initialAssegnazFormState
    };
  }

  render() {
    const handleInputChanges = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      this.setState((prevState: AssegnazFormState) => {
        let stateCopy: any = { ...prevState };
        stateCopy[name] = value;
        return stateCopy;
      });
    };

    const addAssegnazione = () => {
      BadgeDataService.insertAssegnazione(this.state.assegnazForm)
        .then((response) => {
          this.props.setAssegnazioni((prevState) => {
            const assegnazione = {
              badge: this.state.assegnazForm.tipoBadge,
              name: this.state.assegnazForm.assegnazione,
            };
            const stateCopy = { ...prevState, assegnazione };
            return stateCopy;
          });
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            const { success, msg }: TAlert = err.response.data;
            this.props.setAlert({ success, msg });
          }
        });
    };

    const findListEntryToDel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const entryId = event.button.valueOf();
      const listEntry = document.getElementById(`list-assegnaz-entry-${entryId}`) as HTMLElement;
      const entryp = listEntry.querySelector("p") as HTMLParagraphElement;
      const entryName = entryp.innerText;
      return entryName;
    }

    const deleteAssegnazione = () => {
      BadgeDataService.deleteAssegnazione(this.state.assegnazForm)
        .then((response) => {
          this.props.setAssegnazioni((prevState) => {
            const assegnazione = {
              badge: this.state.assegnazForm.tipoBadge,
              name: this.state.assegnazForm.assegnazione,
            };
            let stateCopy = { ...prevState };
            stateCopy = removeElemFromArr(stateCopy, assegnazione);
            return stateCopy;
          });
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            const { success, msg }: TAlert = err.response.data;
            this.props.setAlert({ success, msg });
          }
        });
    };

    const btnDeleteOnClickEvent = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const assegnazToDel = findListEntryToDel(event);
      this.setState((prevState) => {
        let stateCopy = { ...prevState };
        stateCopy.assegnazForm.assegnazione = assegnazToDel;
        return stateCopy;
      });
      deleteAssegnazione();
    };

    return (
      <div>
        <div className="row">
          <h2>Menù Assegnazioni</h2>
          <div className="form-floating col-sm-2">
            <select
              className="form-select form-select-sm"
              id="tipo-badge"
              value={this.state.assegnazForm.tipoBadge}
              onChange={handleInputChanges}
              name="tipo-badge"
              placeholder="tipo badge"
            >
              {this.props.tipiBadge.map((tipo, index) => (
                <option value={tipo} key={index}>
                  {tipo}
                </option>
              ))}
            </select>
            <label htmlFor="tipo-badge">tipo badge</label>
          </div>
        </div>
        <div className="row">
          <div className="list-group list-assegnaz">
            {this.props.assegnazioni
              .filter(
                (assegnazione) =>
                  assegnazione.badge === this.state.assegnazForm.tipoBadge
              )
              .map((assegnazione, index) => (
                <div
                  id={`list-assegnaz-entry-${index}`}
                  className="list-group-item row justify-content-between align-items-center"
                >
                  <p>{assegnazione}</p>
                  <button
                    value={index}
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={(event) => btnDeleteOnClickEvent(event)}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-floating col-sm-2">
              <input
                type="text"
                className="form-control form-control-sm"
                id="assegnazione"
                value={this.state.assegnazForm.assegnazione}
                onChange={handleInputChanges}
                name="assegnazione"
                placeholder="assegnazione"
                autoComplete="off"
              />
              <label htmlFor="assegnazione">assegnazione</label>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3 mb-1">
            <button
              onClick={() => addAssegnazione()}
              className="btn btn-success"
            >
              Aggiungi
            </button>
          </div>
        </div>
        <Alert alert={this.props.alert} setAlert={this.props.setAlert} />
      </div>
    );
  }
};
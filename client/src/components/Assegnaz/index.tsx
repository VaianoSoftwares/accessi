import React from "react";

import "./index.css";

import BadgeDataService from "../../services/badge";

import { TipoBadge } from "../../enums/TipoBadge";
import { Nullable } from "../../types/Nullable";
import { TAlert } from "../../types/TAlert";
import { Assegnazione } from "../../types/Assegnazione";

import Alert from "../alert";

type AssegnazProps = {
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
  tipiBadge: TipoBadge[];
  assegnazioni: Assegnazione[];
  setAssegnazioni: React.Dispatch<React.SetStateAction<Assegnazione[]>>;
};

type AssegnazState = {
  assegnazForm: Assegnazione
};

export default class Assegnaz extends React.Component<AssegnazProps, AssegnazState> {

  static initialAssegnazFormState: Assegnazione = {
    badge: TipoBadge.BADGE,
    name: ""
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
      this.setState({ assegnazForm: { ...this.state.assegnazForm, [name]: value } });
    };

    const addAssegnazione = () => {
      BadgeDataService.insertAssegnazione(this.state.assegnazForm)
        .then((response) => {
          this.props.setAssegnazioni((prevState) => {
            const assegnazione: Assegnazione = {
              badge: this.state.assegnazForm.badge,
              name: this.state.assegnazForm.name.toUpperCase(),
            };
            return [ ...prevState, assegnazione ];
          });

          this.setState({ assegnazForm: { ...this.state.assegnazForm, name: "" } });
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            const { success, msg }: TAlert = err.response.data;
            this.props.setAlert({ success, msg });
          }
        });
    };

    const deleteAssegnazFromArr = (
      arr: Assegnazione[],
      elem: Assegnazione
    ): Assegnazione[] =>
      arr.filter((x) => x.badge !== elem.badge || x.name !== elem.name);

    const deleteAssegnazione = (assegnazToDel: Assegnazione) => {
      console.log(assegnazToDel);
      BadgeDataService.deleteAssegnazione(assegnazToDel)
        .then((response) => {
          this.props.setAssegnazioni((prevState) =>
            deleteAssegnazFromArr(prevState, assegnazToDel)
          );
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
      const { value } = event.currentTarget as HTMLButtonElement;
      
      const assegnazToDel: Assegnazione = {
        badge: this.state.assegnazForm.badge,
        name: value
      };

      deleteAssegnazione(assegnazToDel);
    };

    return (
      <>
        <div className="row">
          <h2>Menù Assegnazioni</h2>
          <div className="w-100 mb-2"></div>
          <div className="form-floating col-sm-2">
            <select
              className="form-select form-select-sm"
              id="tipo-badge"
              value={this.state.assegnazForm.badge}
              onChange={handleInputChanges}
              name="badge"
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
          <div className="form-floating col-sm-2">
            <input
              type="text"
              className="form-control form-control-sm"
              id="assegnazione"
              value={this.state.assegnazForm.name}
              onChange={handleInputChanges}
              name="name"
              placeholder="assegnazione"
              autoComplete="off"
            />
            <label htmlFor="assegnazione">assegnazione</label>
          </div>
          <div className="col-sm-3 mb-1">
            <button
              onClick={() => addAssegnazione()}
              className="btn btn-success"
            >
              Aggiungi
            </button>
          </div>
          <div className="w-100 mb-3"></div>
          <div className="list-group list-assegnaz col-sm-3 assegnaz-list mx-3">
            {this.props.assegnazioni
              .filter(
                (assegnazione) =>
                  assegnazione.name && assegnazione.badge === this.state.assegnazForm.badge
              )
              .map((assegnazione, index) => (
                <div
                  id={`list-assegnaz-entry-${index}`}
                  className="list-group-item"
                  key={index}
                >
                  <div className="row justify-content-between align-items-center">
                    <div className="col-10">
                      <p>{assegnazione.name}</p>
                    </div>
                    <div className="col">
                      <button
                        value={assegnazione.name}
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={(event) => btnDeleteOnClickEvent(event)}
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <Alert alert={this.props.alert} setAlert={this.props.setAlert} />
      </>
    );
  }
};
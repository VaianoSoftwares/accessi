/* eslint-disable react-hooks/exhaustive-deps */

import React from "react";
import { TipoBadge } from "../../enums/TipoBadge";

import BadgeDataService from "../../services/badge";
import { AssegnazFormState } from "../../types/AssegnazFormState";
import { Assegnazioni } from "../../types/Assegnazioni";
import { Nullable } from "../../types/Nullable";
import { TAlert } from "../../types/TAlert";
import { User } from "../../types/User";
import removeElemFromArr from "../../utils/removeElemFromArr";

import Alert from "../alert";

type Props = {
  user: User;
  logout: () => Promise<void>;
  token: string;
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
};

const Assegnaz: React.FC<Props> = (props: Props) => {
    const [tipiBadge, setTipiBadge] = React.useState<TipoBadge[]>([]);
    const [assegnazioni, setAssegnazioni] = React.useState<Nullable<Assegnazioni>>(null);

    const initialAssegnazFormState: AssegnazFormState = {
        tipoBadge: tipiBadge[0],
        assegnazione: "" 
    };

    const [assegnazForm, setAssegnazForm] = React.useState<AssegnazFormState>(initialAssegnazFormState);

    React.useEffect(() => {
        retriveTipi();
        retriveAssegnazioni();
    }, []);

    const retriveTipi = () => {
      BadgeDataService.getTipiBadge()
        .then((response) => {
          //console.log(response.data);
          setTipiBadge(response.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };
      
    const retriveAssegnazioni = () => {
      BadgeDataService.getAssegnazioni()
        .then((response) => {
          console.log(response.data);
          setAssegnazioni(response.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    const handleInputChanges = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setAssegnazForm({ ...assegnazForm, [name]: value });
    };

    const addAssegnazione = () => {
      BadgeDataService.insertAssegnazione(assegnazForm)
        .then((response) => {
          const { tipoBadge, assegnazione } = assegnazForm;
          assegnazioni![tipoBadge].push(assegnazione);
        })
        .catch((err) => {
          console.log(err);
          if(err.response) {
            const { success, msg }: TAlert = err.response.data;
            props.setAlert({ success, msg });
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

    const deleteAssegnazione = (assegnazToDel: string) => {
      BadgeDataService.deleteAssegnazione(assegnazForm)
        .then((response) => {
          const { tipoBadge } = assegnazForm;
          assegnazioni![tipoBadge] = removeElemFromArr(assegnazioni![tipoBadge], assegnazToDel);
        })
        .catch((err) => {
          console.log(err);
          if(err.response) {
            const { success, msg }: TAlert = err.response.data;
            props.setAlert({ success, msg });
          }
        });
    };

    const btnDeleteOnClickEvent = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const assegnazToDel = findListEntryToDel(event);
      deleteAssegnazione(assegnazToDel);
    };

    return (
      <div>
        <div className="row">
          <div className="form-floating col-sm-2">
            <select
              className="form-select form-select-sm"
              id="tipo-badge"
              value={assegnazForm.tipoBadge}
              onChange={handleInputChanges}
              name="tipo-badge"
              placeholder="tipo badge"
            >
              {tipiBadge.map((tipo, index) => (
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
            {assegnazioni![assegnazForm.tipoBadge].map((assegnazione, index) => (
              <div id={`list-assegnaz-entry-${index}`} className="list-group-item row justify-content-between align-items-center">
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
                value={assegnazForm.assegnazione}
                onChange={handleInputChanges}
                name="assegnazione"
                placeholder="assegnazione"
                autoComplete="off"
              />
              <label htmlFor="assegnazione">assegnazione</label>
            </div>
          </div>
          <div className="col-sm-3 mb-1">
            <button onClick={() => addAssegnazione()} className="btn btn-success">
              Aggiungi
            </button>
          </div>
        </div>
        <Alert {...props} alert={props.alert} setAlert={props.setAlert} />
      </div>
    );
};

export default Assegnaz;
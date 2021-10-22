/* eslint-disable react-hooks/exhaustive-deps */

import React from "react";

import BadgeDataService from "../../services/badge.js";

import Alert from "../alert";

const Assegnaz = props => {
    const [tipiBadge, setTipiBadge] = React.useState([]);
    const [assegnazioni, setAssegnazioni] = React.useState({});

    const initialAssegnazFormState = {
        tipoBadge: tipiBadge[0],
        assegnazione: "" 
    };

    const [assegnazForm, setAssegnazForm] = React.useState(initialAssegnazFormState);

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
          //console.log(response.data);
          setAssegnazioni(response.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    const handleInputChanges = event => {
      const { name, value } = event.target;
      setAssegnazForm({ ...assegnazForm, [name]: value });
    };

    const addAssegnazione = () => {
      const { tipoBadge, assegnazione } = assegnazForm;
      BadgeDataService.insertAssegnazione(tipoBadge, assegnazione)
        .then((response) => {
          assegnazioni[tipoBadge].push(assegnazione);
        })
        .catch((err) => {
          console.log(err);
          if(err.response) {
            const { success, msg } = err.response.data;
            props.setAlert({ success, msg });
          }
        });
    };

    const removeElemFromArr = (array, elem) => {
      return array.filter((x) => x !== elem);
    };

    const findListEntryToDel = (event) => {
      const entryId = event.target.key;
      const listEntry = document.getElementById(`list-assegnaz-entry-${entryId}`);
      return listEntry.querySelector("p").innerText;
    }

    const deleteAssegnazione = (assegnazToDel) => {
      const { tipoBadge } = assegnazForm;
      BadgeDataService.deleteAssegnazione(tipoBadge, assegnazToDel)
        .then((response) => {
          assegnazioni[tipoBadge] = removeElemFromArr(assegnazioni[tipoBadge], assegnazToDel);
        })
        .catch((err) => {
          console.log(err);
          if(err.response) {
            const { success, msg } = err.response.data;
            props.setAlert({ success, msg });
          }
        });
    };

    const btnDeleteOnClickEvent = (event) => {
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
            {assegnazioni[assegnazForm.tipoBadge].map((assegnazione, index) => (
              <div id={`list-assegnaz-entry-${index}`} className="list-group-item row justify-content-between align-items-center">
                <p>{assegnazione}</p>
                <button
                  key={index}
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
        <Alert alert={props.alert} setAlert={props.setAlert} />
      </div>
    );
};

export default Assegnaz;
import React from "react";

import BadgeDataService from "../services/badge.js";

const BadgeForm = props => {
  const [reparti, setReparti] = React.useState([]);

  React.useEffect(() => {
    BadgeDataService.token = props.token;
    retriveReparti();
  }, []);

  const retriveReparti = () => {
    BadgeDataService.getReparti()
      .then(response => {
        console.log(response.data);
        setReparti(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <div>
      <div className="form-row">
        <div className="form-group col-md-3">
          <label htmlFor="barcode">barcode</label>
          <input
            type="text"
            className="form-control"
            id="barcode"
            value={props.badgeForm.barcode}
            onChange={props.handleInputChanges}
            name="barcode"
          />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="descrizione">descrizione</label>
          <input
            type="text"
            className="form-control"
            id="descrizione"
            value={props.badgeForm.descrizione}
            onChange={props.handleInputChanges}
            name="descrizione"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group col-md-3">
          <label htmlFor="reparto">reparto</label>
          <select
            className="form-control"
            id="reparto"
            value={props.badgeForm.reparto}
            onChange={props.handleInputChanges}
            name="reparto"
          >
            {reparti.map((reparto, index) => (
              <option value={reparto} key={index}>
                {reparto}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-md-3">
          <label htmlFor="ubicazione">ubicazione</label>
          <input
            type="text"
            className="form-control"
            id="ubicazione"
            value={props.badgeForm.ubicazione}
            onChange={props.handleInputChanges}
            name="ubicazione"
          />
        </div>
      </div>
    </div>
  );
};

export default BadgeForm;
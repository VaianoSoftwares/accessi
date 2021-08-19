import React from "react";

const ChiaveForm = props => {
  const [isChiaveCheckbox, setIsChiaveCheckbox] = React.useState(true);

  const checkboxHandler = () => {
    setIsChiaveCheckbox(!isChiaveCheckbox);
    const inputs = document.querySelectorAll(".chiave-form input:not(#is_chiave)");
    inputs.forEach(input => {
      input.disabled = isChiaveCheckbox;
    });
  };

  return (
    <div className="chiave-form">
      <br/>
      <div className="form-check">
        <label htmlFor="is_chiave" className="form-check-label">
          chiave
        </label>
        <input
          type="checkbox"
          className="form-check-input"
          id="is_chiave"
          checked={isChiaveCheckbox}
          onChange={checkboxHandler}
        />
      </div>
      <br/>
      <div className="row">
        <div className="form-group col-md-3">
          <label htmlFor="indirizzo">indirizzo</label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="indirizzo"
            value={props.badgeForm.indirizzo}
            onChange={props.handleInputChanges}
            name="indirizzo"
          />
        </div>
        <div className="form-group col-md-3">
          <label htmlFor="edificio">edificio</label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="edificio"
            value={props.badgeForm.edificio}
            onChange={props.handleInputChanges}
            name="edificio"
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-3">
          <label htmlFor="citta">citta</label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="citta"
            value={props.badgeForm.citta}
            onChange={props.handleInputChanges}
            name="citta"
          />
        </div>
        <div className="form-group col-md-3">
          <label htmlFor="piano">piano</label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="piano"
            value={props.badgeForm.piano}
            onChange={props.handleInputChanges}
            name="piano"
          />
        </div>
      </div>
      <br/>
    </div>
  );
};

export default ChiaveForm;
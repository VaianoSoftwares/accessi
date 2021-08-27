import React from "react";
//import _ from "underscore";

const FormButtons = props => {
    const openPopup = () => props.setIsShown(true);

    return (
      <div
        className="form-buttons"
        style={{ position: "absolute", left: "55%", top: "20%" }}
      >
        <div className="col-sm-3">
          <button onClick={() => props.setReadOnlyForm(false)} className="btn btn-success">
            Ricerca
          </button>
        </div>
        <div className="col-sm-3">
          <button
            onClick={() => props.findBadges()}
            className="btn btn-success"
          >
            Trova
          </button>
        </div>
        <div className="col-sm-3">
          <button onClick={() => props.setReadOnlyForm(true)} className="btn btn-success">
            Annulla
          </button>
        </div>
        <div className="col-sm-3">
          <button onClick={openPopup} className="btn btn-success">
            Accesso<br/>Provvisori
          </button>
        </div>
      </div>
    );
};

export default FormButtons;
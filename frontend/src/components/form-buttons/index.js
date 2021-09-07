import React from "react";
import "./index.css";

const FormButtons = props => {
    const openPopup = () => props.setIsShown(true);

    return (
      <div className="form-buttons">
        <div className="col-sm-3 mb-1">
          <button onClick={() => props.setReadOnlyForm(false)} className="btn btn-success home-form-btn">
            Ricerca
          </button>
        </div>
        <div className="col-sm-3 mb-1">
          <button
            onClick={() => props.findBadges()}
            className="btn btn-success home-form-btn"
          >
            Trova
          </button>
        </div>
        <div className="col-sm-3 mb-1">
          <button onClick={() => props.setReadOnlyForm(true)} className="btn btn-success home-form-btn">
            Annulla
          </button>
        </div>
        <div className="col-sm-3 mb-1">
          <button onClick={openPopup} className="btn btn-success home-form-btn">
            Accesso<br/>Provvisori
          </button>
        </div>
      </div>
    );
};

export default FormButtons;
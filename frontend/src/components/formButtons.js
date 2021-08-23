import React from "react";

const FormButtons = props => {
    return (
      <div className="form-buttons" style={{position:"absolute", left:"55%", top:"20%"}}>
        <div className="col-sm-3">
          <button onClick={() => {}} className="btn btn-success">
            Ricerca
          </button>
        </div>
        <div className="col-sm-3">
          <button onClick={() => props.findBadges()} className="btn btn-success">
            Trova
          </button>
        </div>
        <div className="col-sm-3">
          <button onClick={() => props.timbra()} className="btn btn-success">
            Timbra
          </button>
        </div>
        <div className="col-sm-3">
          <button onClick={() => {}} className="btn btn-success">
            Annulla
          </button>
        </div>
        <div className="col-sm-3">
          <button onClick={() => {}} className="btn btn-success">
            Accesso
            <br />
            Provvisorio
          </button>
        </div>
      </div>
    );
};

export default FormButtons;
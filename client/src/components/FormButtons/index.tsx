import React from "react";
import SerialComponent from "../serial-component";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import "./index.css";

type Props = {
  findBadges: () => void;
  insertBadge: () => void;
  updateBadge: () => void;
  deleteBadge: () => void;
  refreshPage: () => void;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  readOnlyForm: boolean;
  setReadOnlyForm: React.Dispatch<React.SetStateAction<boolean>>;
  admin: boolean;
  setScannedValue: React.Dispatch<React.SetStateAction<string>>;
};

const FormButtons: React.FC<Props> = (props: Props) => {
  const openPopup = () => props.setIsShown(true);

  return (
    <div className="form-buttons">
      <div className="col mb-1">
        <SerialComponent setScannedValue={props.setScannedValue} />
      </div>
      <div className="row mb-1">
        <div className="col-sm-5">
          <button
            onClick={() => props.setReadOnlyForm(!props.readOnlyForm)}
            className="btn btn-success home-form-btn"
          >
            Form
          </button>
        </div>
        <div className="col-sm-5">
          <b style={props.readOnlyForm ? { color: "red" } : { color: "green" }}>
            {props.readOnlyForm && "Non "}
            {"Attivo"}
          </b>
        </div>
      </div>
      <div className="col-sm-3 mb-1">
        <button
          onClick={() => props.findBadges()}
          className="btn btn-success home-form-btn"
        >
          Trova
        </button>
      </div>
      {props.admin === true && (
        <div>
          <div className="col-sm-3 mb-1">
            <button
              onClick={() => props.insertBadge()}
              className="btn btn-success home-form-btn"
            >
              Aggiungi
            </button>
          </div>
          <div className="col-sm-3 mb-1">
            <button
              onClick={() => props.updateBadge()}
              className="btn btn-success home-form-btn"
            >
              Aggiorna
            </button>
          </div>
          <div className="col-sm-3 mb-1">
            <button
              onClick={() => props.deleteBadge()}
              className="btn btn-success home-form-btn"
            >
              Elimina
            </button>
          </div>
          <div className="col-sm-3 mb-1">
            <button
              onClick={() => htmlTableToExcel("badge-table")}
              className="btn btn-success home-form-btn"
            >
              Excel
            </button>
          </div>
        </div>
      )}
      <div className="col-sm-3 mb-1">
        <button onClick={openPopup} className="btn btn-success home-form-btn">
          Accesso
          <br />
          Provvisori
        </button>
      </div>
    </div>
  );
};

export default FormButtons;

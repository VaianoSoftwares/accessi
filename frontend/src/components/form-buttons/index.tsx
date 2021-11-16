import React from "react";
import { RouteComponentProps } from "react-router";
import "./index.css";

interface Props extends RouteComponentProps<any> {
  findBadges: () => void;
  insertBadge: () => void;
  updateBadge: () => void;
  deleteBadge: () => void;
  refreshPage: () => void;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  setReadOnlyForm: React.Dispatch<React.SetStateAction<boolean>>;
  admin: boolean;
};

const FormButtons: React.FC<Props> = (props: Props) => {
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
        {props.admin === true && (
          <div>
            <div className="col-sm-3 mb-1">
              <button onClick={() => props.insertBadge()} className="btn btn-success home-form-btn">
                Aggiungi
              </button>
            </div>
            <div className="col-sm-3 mb-1">
              <button onClick={() => props.updateBadge()} className="btn btn-success home-form-btn">
                Aggiorna
              </button>
            </div>
            <div className="col-sm-3 mb-1">
              <button onClick={() => props.deleteBadge()} className="btn btn-success home-form-btn">
                Elimina
              </button>
            </div>
          </div>
        )}
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
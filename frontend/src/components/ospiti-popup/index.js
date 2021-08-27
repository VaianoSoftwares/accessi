import React from "react";
import Popup from "reactjs-popup";
import "./index.css";

import { OspitiForm } from "../ospiti-form.js";

export const OspitiPopup = (props) => {
  const closePopup = () => props.setIsShown(false);

  const initialOspFormState = {
    barcode: "",
    nome: "",
    cognome: "",
    telefono: "",
    ditta: "",
    tipo_doc: "",
    ndoc: "",
    targa1: "",
    targa2: "",
    targa3: "",
    targa4: ""
  };

  const [ospForm, setOspForm] = React.useState(initialOspFormState);

  const handleOspInputChanges = (event) => {
    const { name, value } = event.target;
    setOspForm({ ...ospForm, [name]: value });
  };

  return (
    <Popup open={props.isShown} closeOnDocumentClick onClose={closePopup} modal>
      <div className="modal-osp">
        <button className="close" onClick={closePopup}>
          &times;
        </button>
        <div className="header">Accessi Provvisori</div>
        <div className="content">
          <OspitiForm
            ospForm={ospForm}
            handleOspInputChanges={handleOspInputChanges}
            tipiDoc={props.tipiDoc}
            isVeicolo={props.isVeicolo}
          />
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              props.timbra(ospForm);
              setOspForm(initialOspFormState);
              closePopup();
            }}
          >
            Timbra
          </button>
        </div>
      </div>
    </Popup>
  );
};

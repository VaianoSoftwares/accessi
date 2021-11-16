// Modules
import React from "react";
import Popup from "reactjs-popup";
// Style
import "./index.css";
// Components
import OspitiForm from "../ospiti-form.jsx";
// Types
import { OspFormState } from "../../types/OspFormState";
import { RouteComponentProps } from "react-router";
import { TimbraDoc } from "../../types/TimbraDoc";

interface Props extends RouteComponentProps<any> {
  isShown: boolean;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  tipiDoc: string[];
  timbra: (data: TimbraDoc) => void;
  isVeicolo: boolean;
  postazione: string;
};

const OspitiPopup: React.FC<Props> = (props: Props) => {
  const closePopup = () => props.setIsShown(false);

  const initialOspFormState: OspFormState = {
    barcode: "",
    nome: "",
    cognome: "",
    telefono: "",
    ditta: "",
    tdoc: "",
    ndoc: "",
    targa1: "",
    targa2: "",
    targa3: "",
    targa4: ""
  };

  const [ospForm, setOspForm] = React.useState<OspFormState>(initialOspFormState);

  const handleOspInputChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            {...props}
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
              props.timbra({ ...ospForm, postazione: props.postazione });
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

export default OspitiPopup;
// Modules
import React from "react";
import Popup from "reactjs-popup";
// Style
import "./index.css";
// Components
import OspitiForm from "../ospiti-form";
// Types
import { OspFormState } from "../../types/OspFormState";
import { TimbraDoc } from "../../types/TimbraDoc";
import { TipoBadge } from "../../enums/TipoBadge";

type Props = {
  isShown: boolean;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  tipiDoc: string[];
  timbra: (data: TimbraDoc) => void;
  isVeicolo: boolean;
  postazione: string;
  tipoBadge: TipoBadge;
};

const OspitiPopup: React.FC<Props> = (props: Props) => {
  const closePopup = () => props.setIsShown(false);

  const initialOspFormState: OspFormState = {
    barcode: "",
    nome: "",
    cognome: "",
    telefono: "",
    ditta: "",
    tdoc: "carta identita",
    ndoc: "",
    targa1: "",
    targa2: "",
    targa3: "",
    targa4: ""
  };

  const [ospForm, setOspForm] = React.useState<OspFormState>(initialOspFormState);

  const handleOspInputChanges = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setOspForm({ ...ospForm, [name]: value });
  };

  const timbraBtnEvent : React.MouseEventHandler<HTMLButtonElement> = () => {
    props.timbra({ 
      ...ospForm,
      postazione: props.postazione,
      tipo: props.tipoBadge
    });
    setOspForm(initialOspFormState);
    closePopup();
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
            onClick={timbraBtnEvent}
          >
            Timbra
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default OspitiPopup;
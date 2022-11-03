// Modules
import React from "react";
import Popup from "reactjs-popup";
import Cf from "codice-fiscale-js";
// Style
import "./index.css";
// Components
import OspitiForm from "../ospiti-form";
// Types
import { OspFormState } from "../../types/OspFormState";
import { TimbraDoc } from "../../types/TimbraDoc";
import { TipoBadge } from "../../enums/TipoBadge";
import handleInputChanges from "../../utils/handleInputChanges";
import { TEvent, TEventInput } from "../../types/TEvent";

type Props = {
  isShown: boolean;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  tipiDoc: string[];
  timbra: (data: TimbraDoc) => void;
  isVeicolo: boolean;
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
    tdoc: "CARTA IDENTITA",
    ndoc: "",
    targa1: "",
    targa2: "",
    targa3: "",
    targa4: ""
  };

  const [ospForm, setOspForm] = React.useState<OspFormState>(initialOspFormState);

  // const handleOspInputChanges = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = event.target;
  //   setOspForm({ ...ospForm, [name]: value });
  // };

  const timbraBtnEvent : React.MouseEventHandler<HTMLButtonElement> = () => {
    props.timbra({ 
      ...ospForm,
      cliente: sessionStorage.getItem("cliente") as string,
      postazione: sessionStorage.getItem("postazione") as string,
      tipo: props.tipoBadge
    });
    setOspForm(initialOspFormState);
    closePopup();
  };

  const handleOspInputChanges = (event: TEvent) =>
    handleInputChanges(event, ospForm, setOspForm);

  const handleNdocInputChanges = (
    event: TEventInput
  ) => {
    const { value } = event.target;
    if (Cf.check(value)) {
      const { name, surname } = Cf.computeInverse(value);
      setOspForm({ ...ospForm, ndoc: value, nome: name, cognome: surname });
    }
    else {
      handleOspInputChanges(event);
    }
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
            handleNdocInputChanges={handleNdocInputChanges}
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
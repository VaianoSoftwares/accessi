// Modules
import React from "react";
import Popup from "reactjs-popup";
import Cf from "codice-fiscale-js";
// Style
import "./index.css";
// Components
import OspitiForm from "../ospiti-form";
// Types
import handleInputChanges from "../../utils/handleInputChanges";
import { TEvent, TEventInput } from "../../types/TEvent";
import { TTDoc } from "../../types/Badge";
import { BadgeFormState } from "../../types/BadgeFormState";

type Props = {
  isShown: boolean;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  tipiDoc: TTDoc[];
  insertOsp: (form: BadgeFormState) => void;
  isVeicolo: boolean;
};

const OspitiPopup: React.FC<Props> = (props: Props) => {
  const closePopup = () => props.setIsShown(false);

  const initialOspFormState: BadgeFormState = {
    barcode: "",
    descrizione: "PROVVISORIO",
    tipo: "PROVVISORIO",
    assegnazione: "OSPITE",
    stato: "VALIDO",
    ubicazione: "",
    nome: "",
    cognome: "",
    telefono: "",
    ditta: "",
    tdoc: "",
    ndoc: "",
    pfp: null,
    scadenza: "",
    targa1: "",
    targa2: "",
    targa3: "",
    targa4: ""
  };

  const [ospForm, setOspForm] = React.useState<BadgeFormState>(initialOspFormState);

  // const handleOspInputChanges = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = event.target;
  //   setOspForm({ ...ospForm, [name]: value });
  // };

  const insertOspBtnEvent : React.MouseEventHandler<HTMLButtonElement> = () => {
    props.insertOsp(ospForm);
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
            onClick={insertOspBtnEvent}
          >
            Timbra
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default OspitiPopup;
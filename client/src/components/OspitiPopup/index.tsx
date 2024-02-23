import { useRef } from "react";
import Popup from "reactjs-popup";
import Cf from "codice-fiscale-js";
import "./index.css";
import { FormRef, TEventInput } from "../../types";
import { Postazione, TDOCS } from "../../types/badges";
import { InsertArchProvForm } from "../../types/forms";
import toast from "react-hot-toast";
import { InsertArchProvData } from "../../types/archivio";

export default function OspitiPopup(props: {
  isShown: boolean;
  closePopup: () => void;
  insertOsp: (data: InsertArchProvData) => void;
  currPostazione: Postazione | undefined;
}) {
  const formRef = useRef<FormRef<InsertArchProvForm>>({
    codice: null,
    nome: null,
    cognome: null,
    ditta: null,
    telefono: null,
    ndoc: null,
    tdoc: null,
  });

  function formToObj() {
    const obj: InsertArchProvForm = {};

    Object.entries(formRef.current)
      .filter(([_, el]) => el !== null)
      .forEach(
        ([key, el]) => (obj[key as keyof InsertArchProvForm] = el?.value)
      );

    return {
      ...obj,
      postazione: props.currPostazione!.id,
      codice: "",
      ndoc: "",
      tdoc: "",
    } satisfies InsertArchProvData;
  }

  function insertOspBtnEvent() {
    if (props.currPostazione) {
      props.insertOsp(formToObj());
      props.closePopup();
    } else {
      toast.error("Nessuna postazione selezionata");
    }
  }

  function onChangeNDocOsp(e: TEventInput) {
    const { value } = e.target;
    if (!value || !Cf.check(value)) return;

    const { name, surname } = Cf.computeInverse(value);

    formRef.current.nome && (formRef.current.nome.value = name);
    formRef.current.cognome && (formRef.current.cognome.value = surname);
    formRef.current.tdoc && (formRef.current.tdoc.value = "CARTA IDENTITA");
  }

  return (
    <Popup
      open={props.isShown}
      closeOnDocumentClick
      onClose={props.closePopup}
      modal
    >
      <div className="modal-osp">
        <button className="close" onClick={props.closePopup}>
          &times;
        </button>
        <div className="header">Accessi Provvisori</div>
        <div className="content">
          <div className="submit-form osp-form">
            <div className="row mb-1">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-codice"
                  placeholder="codice"
                  ref={(el) => (formRef.current.codice = el)}
                  required
                />
                <label htmlFor="osp-codice">codice</label>
              </div>
            </div>
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-nome"
                  placeholder="nome"
                  ref={(el) => (formRef.current.nome = el)}
                />
                <label htmlFor="osp-nome">nome</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-cognome"
                  placeholder="cognome"
                  ref={(el) => (formRef.current.cognome = el)}
                />
                <label htmlFor="osp-cognome">cognome</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-ditta"
                  placeholder="ditta"
                  ref={(el) => (formRef.current.ditta = el)}
                />
                <label htmlFor="osp-ditta">ditta</label>
              </div>
            </div>
            <div className="row mb-1">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-telefono"
                  placeholder="telefono"
                  ref={(el) => (formRef.current.telefono = el)}
                />
                <label htmlFor="osp-telefono">telefono</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-ndoc"
                  placeholder="num documento"
                  ref={(el) => (formRef.current.ndoc = el)}
                  onChange={onChangeNDocOsp}
                  required
                />
                <label htmlFor="osp-ndoc">num documento</label>
              </div>
              <div className="form-floating col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="osp-tdoc"
                  placeholder="tipo documento"
                  ref={(el) => (formRef.current.tdoc = el)}
                  defaultValue={"CARTA IDENTITA"}
                  required
                >
                  {TDOCS.map((tipoDoc) => (
                    <option value={tipoDoc} key={tipoDoc}>
                      {tipoDoc}
                    </option>
                  ))}
                </select>
                <label htmlFor="osp-tdoc">tipo documento</label>
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={insertOspBtnEvent}>
            Invio
          </button>
        </div>
      </div>
    </Popup>
  );
}

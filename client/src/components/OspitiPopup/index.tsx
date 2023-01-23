// Modules
import React from "react";
import Popup from "reactjs-popup";
import Cf from "codice-fiscale-js";
// Style
import "./index.css";
// Types
import { TEventInput } from "../../types/TEvent";
import { TDOCS } from "../../types/Badge";

type Props = {
  isShown: boolean;
  closePopup: () => void;
  insertOsp: (data: FormData) => void;
  isVeicolo: boolean;
};

export default function OspitiPopup(props: Props) {
  const barcodeOspRef = React.useRef<HTMLInputElement>(null);
  const nomeOspRef = React.useRef<HTMLInputElement>(null);
  const cognomeOspRef = React.useRef<HTMLInputElement>(null);
  const telefonoOspRef = React.useRef<HTMLInputElement>(null);
  const dittaOspRef = React.useRef<HTMLInputElement>(null);
  const tdocOspRef = React.useRef<HTMLSelectElement>(null);
  const ndocOspRef = React.useRef<HTMLInputElement>(null);
  const targa1OspRef = React.useRef<HTMLInputElement>(null);
  const targa2OspRef = React.useRef<HTMLInputElement>(null);
  const targa3OspRef = React.useRef<HTMLInputElement>(null);
  const targa4OspRef = React.useRef<HTMLInputElement>(null);

  function createFormData() {
    const formData = new FormData();
    formData.append("barcode", barcodeOspRef.current!.value);
    formData.append("descrizione", "PROVVISORIO");
    formData.append("tipo", "PROVVISORIO");
    formData.append("assegnazione", "OSPITE");
    formData.append("stato", "VALIDO");
    formData.append("nome", nomeOspRef.current!.value);
    formData.append("cognome", cognomeOspRef.current!.value);
    formData.append("telefono", telefonoOspRef.current!.value);
    formData.append("ditta", dittaOspRef.current!.value);
    formData.append("tdoc", tdocOspRef.current!.value);
    formData.append("ndoc", ndocOspRef.current!.value);
    targa1OspRef.current && formData.append("targa1", targa1OspRef.current.value);
    targa2OspRef.current && formData.append("targa2", targa2OspRef.current.value);
    targa3OspRef.current && formData.append("targa3", targa3OspRef.current.value);
    targa4OspRef.current && formData.append("targa4", targa4OspRef.current.value);
    return formData;
  }

  function insertOspBtnEvent() {
    props.insertOsp(createFormData());
    props.closePopup();
  }

  function onChangeNDocOsp(e: TEventInput) {
    const { value } = e.target;
    if (!value || !Cf.check(value)) return;

    const { name, surname } = Cf.computeInverse(value);

    nomeOspRef.current!.value = name;
    cognomeOspRef.current!.value = surname;
    tdocOspRef.current!.value = "CARTA IDENTITA";
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
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-barcode"
                  placeholder="barcode"
                  ref={barcodeOspRef}
                  defaultValue=""
                />
                <label htmlFor="osp-barcode">barcode</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-nome"
                  placeholder="nome"
                  ref={nomeOspRef}
                  defaultValue=""
                />
                <label htmlFor="osp-nome">nome</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-cognome"
                  placeholder="cognome"
                  ref={cognomeOspRef}
                  defaultValue=""
                />
                <label htmlFor="osp-cognome">cognome</label>
              </div>
            </div>
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-ditta"
                  placeholder="ditta"
                  ref={dittaOspRef}
                  defaultValue=""
                />
                <label htmlFor="osp-ditta">ditta</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-telefono"
                  placeholder="telefono"
                  ref={telefonoOspRef}
                  defaultValue=""
                />
                <label htmlFor="osp-telefono">telefono</label>
              </div>
              <div className="form-floating col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="osp-tdoc"
                  placeholder="tipo documento"
                  ref={tdocOspRef}
                  defaultValue={"CARTA IDENTITA"}
                >
                  {TDOCS.map((tipoDoc, index) => (
                    <option
                      value={tipoDoc}
                      key={index}
                    >
                      {tipoDoc}
                    </option>
                  ))}
                </select>
                <label htmlFor="osp-tdoc">tipo documento</label>
              </div>
            </div>
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-ndoc"
                  placeholder="num documento"
                  ref={ndocOspRef}
                  defaultValue=""
                  onChange={onChangeNDocOsp}
                />
                <label htmlFor="osp-ndoc">num documento</label>
              </div>
            </div>
            {props.isVeicolo === true && (
              <div>
                <div className="row">
                  <div className="form-floating col-sm-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="osp-targa1"
                      placeholder="targa1"
                      ref={targa1OspRef}
                      defaultValue=""
                    />
                    <label htmlFor="osp-targa1">targa1</label>
                  </div>
                  <div className="form-floating col-sm-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="osp-targa2"
                      placeholder="targa2"
                      ref={targa2OspRef}
                      defaultValue=""
                    />
                    <label htmlFor="osp-targa2">targa2</label>
                  </div>
                </div>
                <div className="row">
                  <div className="form-floating col-sm-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="osp-targa3"
                      placeholder="targa3"
                      ref={targa3OspRef}
                      defaultValue=""
                    />
                    <label htmlFor="osp-targa3">targa3</label>
                  </div>
                  <div className="form-floating col-sm-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="osp-targa4"
                      placeholder="targa4"
                      ref={targa4OspRef}
                      defaultValue=""
                    />
                    <label htmlFor="osp-targa4">targa4</label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={insertOspBtnEvent}>
            Timbra
          </button>
        </div>
      </div>
    </Popup>
  );
}

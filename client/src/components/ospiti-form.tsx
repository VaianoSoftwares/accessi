import React from "react";
import { TTDoc } from "../types/Badge";
import { BadgeFormState } from "../types/BadgeFormState";
import { TEvent, TEventInput } from "../types/TEvent";

type Props = {
  ospForm: BadgeFormState;
  handleOspInputChanges: (event: TEvent) => void;
  handleNdocInputChanges: (event: TEventInput) => void;
  tipiDoc: TTDoc[];
  isVeicolo: boolean;
};

const OspitiForm: React.FC<Props> = (props: Props) => {
  return (
    <div className="submit-form osp-form">
      <div className="row">
        <div className="form-floating col-sm-4">
          <input
            type="text"
            className="form-control form-control-sm"
            id="osp-barcode"
            value={props.ospForm.barcode}
            onChange={props.handleOspInputChanges}
            name="barcode"
            placeholder="barcode"
          />
          <label htmlFor="osp-barcode">barcode</label>
        </div>
        <div className="form-floating col-sm-4">
          <input
            type="text"
            className="form-control form-control-sm"
            id="osp-nome"
            value={props.ospForm.nome}
            onChange={props.handleOspInputChanges}
            name="nome"
            placeholder="nome"
          />
          <label htmlFor="osp-nome">nome</label>
        </div>
        <div className="form-floating col-sm-4">
          <input
            type="text"
            className="form-control form-control-sm"
            id="osp-cognome"
            value={props.ospForm.cognome}
            onChange={props.handleOspInputChanges}
            name="cognome"
            placeholder="cognome"
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
            value={props.ospForm.ditta}
            onChange={props.handleOspInputChanges}
            name="ditta"
            placeholder="ditta"
          />
          <label htmlFor="osp-ditta">ditta</label>
        </div>
        <div className="form-floating col-sm-4">
          <input
            type="text"
            className="form-control form-control-sm"
            id="osp-telefono"
            value={props.ospForm.telefono}
            onChange={props.handleOspInputChanges}
            name="telefono"
            placeholder="telefono"
          />
          <label htmlFor="osp-telefono">telefono</label>
        </div>
        <div className="form-floating col-sm-4">
          <select
            className="form-select form-select-sm"
            id="osp-tdoc"
            value={props.ospForm.tdoc}
            onChange={props.handleOspInputChanges}
            name="tdoc"
            placeholder="tipo documento"
          >
            {props.tipiDoc.map((tipoDoc, index) => (
              <option value={tipoDoc} key={index}>
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
            value={props.ospForm.ndoc}
            onChange={props.handleNdocInputChanges}
            name="ndoc"
            placeholder="num documento"
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
                value={props.ospForm.targa1}
                onChange={props.handleOspInputChanges}
                name="targa1"
                placeholder="targa1"
              />
              <label htmlFor="osp-targa1">targa1</label>
            </div>
            <div className="form-floating col-sm-4">
              <input
                type="text"
                className="form-control form-control-sm"
                id="osp-targa2"
                value={props.ospForm.targa2}
                onChange={props.handleOspInputChanges}
                name="targa2"
                placeholder="targa2"
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
                value={props.ospForm.targa3}
                onChange={props.handleOspInputChanges}
                name="targa3"
                placeholder="targa3"
              />
              <label htmlFor="osp-targa3">targa3</label>
            </div>
            <div className="form-floating col-sm-4">
              <input
                type="text"
                className="form-control form-control-sm"
                id="osp-targa4"
                value={props.ospForm.targa4}
                onChange={props.handleOspInputChanges}
                name="targa4"
                placeholder="targa4"
              />
              <label htmlFor="osp-targa4">targa4</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OspitiForm;

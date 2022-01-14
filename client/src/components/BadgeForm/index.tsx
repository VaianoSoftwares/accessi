/* eslint-disable react-hooks/exhaustive-deps */
// Modules
import React from "react";
// Style
import "./index.css";
// Components
import BadgeDataService from "../../services/badge";
import { BadgeFormState } from "../../types/BadgeFormState";
// Types
import { TipoBadge } from "../../enums/TipoBadge";
import { StatoBadge } from "../../enums/StatoBadge";

type Props = {
  badgeForm: BadgeFormState;
  handleInputChanges: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleInputFileChanges: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tipiDoc: string[];
  readOnlyForm: boolean;
  admin: boolean;
  token: string;
  pfpUrl: string;
};

const BadgeForm: React.FC<Props> = (props: Props) => {
  const [tipi, setTipi] = React.useState<TipoBadge[]>([]);
  const [assegnazioni, setAssegnazioni] = React.useState<string[]>([]);
  const [stati, setStati] = React.useState<StatoBadge[]>([]);

  React.useEffect(() => {
    BadgeDataService.token = props.token;
    retriveTipi();
    retriveAssegnazioni();
    retriveStati();
  }, []);
  
  const retriveTipi = () => {
    BadgeDataService.getTipiBadge()
      .then(response => {
        //console.log(response.data);
        setTipi(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };
  
  const retriveAssegnazioni = () => {
    BadgeDataService.getAssegnazioni(props.badgeForm.tipo)
      .then(response => {
        //console.log(response.data);
        setAssegnazioni(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const retriveStati = () => {
    BadgeDataService.getStati()
      .then(response => {
        //console.log(response.data);
        setStati(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <div className="badge-form">
      <br />
      <div className="row">
        <div className="form-floating col-sm-2">
          <input
            type="text"
            className="form-control form-control-sm"
            id="barcode"
            value={props.badgeForm.barcode}
            onChange={props.handleInputChanges}
            name="barcode"
            placeholder="barcode"
            readOnly={props.readOnlyForm}
            autoComplete="off"
          />
          <label htmlFor="barcode">barcode</label>
        </div>
        <div className="form-floating col-sm-4">
          <input
            type="text"
            className="form-control form-control-sm"
            id="descrizione"
            value={props.badgeForm.descrizione}
            onChange={props.handleInputChanges}
            name="descrizione"
            placeholder="descrizione"
            readOnly={props.readOnlyForm}
            autoComplete="off"
          />
          <label htmlFor="descrizione">descrizione</label>
        </div>
      </div>
      <div className="row">
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="tipo"
            value={props.badgeForm.tipo}
            onChange={props.handleInputChanges}
            name="tipo"
            placeholder="tipo"
          >
            {tipi.map((tipo, index) => (
              <option
                value={tipo}
                key={index}
                disabled={
                  props.badgeForm.tipo !== tipo && props.readOnlyForm === true
                }
              >
                {tipo}
              </option>
            ))}
          </select>
          <label htmlFor="tipo">tipo</label>
        </div>
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="assegnazione"
            value={props.badgeForm.assegnazione || ""}
            onChange={props.handleInputChanges}
            name="assegnazione"
            placeholder="assegnazione"
          >
            <option value="" key="-1"></option>
            {assegnazioni.map((assegnaz, index) => (
              <option value={assegnaz} key={index} disabled={!!props.readOnlyForm}>
                {assegnaz}
              </option>
            ))}
          </select>
          <label htmlFor="assegnazione">assegnazione</label>
        </div>
      </div>
      <div className="row">
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="stato"
            value={props.badgeForm.stato || ""}
            onChange={props.handleInputChanges}
            name="stato"
            placeholder="stato"
          >
            <option value="" key="-1"></option>
            {stati.map((stato, index) => (
              <option value={stato} key={index} disabled={!!props.readOnlyForm}>
                {stato}
              </option>
            ))}
          </select>
          <label htmlFor="stato">stato</label>
        </div>
        <div className="form-floating col-sm-4">
          <input
            type="text"
            className="form-control form-control-sm"
            id="ubicazione"
            value={props.badgeForm.ubicazione}
            onChange={props.handleInputChanges}
            name="ubicazione"
            placeholder="ubicazione"
            readOnly={!!props.readOnlyForm}
            autoComplete="off"
          />
          <label htmlFor="ubicazione">ubicazione</label>
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col-2 pfp-container" /*align="center"*/>
          <img
            alt=""
            src={props.pfpUrl}
            className="pfp"
          />
        </div>
        <div className="col-8">
          <div className="row">
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="nome"
                value={props.badgeForm.nome}
                onChange={props.handleInputChanges}
                name="nome"
                placeholder="nome"
                readOnly={!!props.readOnlyForm}
                autoComplete="off"
              />
              <label htmlFor="nome">nome</label>
            </div>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="cognome"
                value={props.badgeForm.cognome}
                onChange={props.handleInputChanges}
                name="cognome"
                placeholder="cognome"
                readOnly={!!props.readOnlyForm}
                autoComplete="off"
              />
              <label htmlFor="cognome">cognome</label>
            </div>
          </div>
          <div className="row">
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="ditta"
                value={props.badgeForm.ditta}
                onChange={props.handleInputChanges}
                name="ditta"
                placeholder="ditta"
                readOnly={!!props.readOnlyForm}
                autoComplete="off"
              />
              <label htmlFor="ditta">ditta</label>
            </div>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="telefono"
                value={props.badgeForm.telefono}
                onChange={props.handleInputChanges}
                name="telefono"
                placeholder="telefono"
                readOnly={!!props.readOnlyForm}
                autoComplete="off"
              />
              <label htmlFor="telefono">telefono</label>
            </div>
          </div>
          <div className="row">
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="tdoc"
                value={props.badgeForm.tdoc || ""}
                onChange={props.handleInputChanges}
                name="tdoc"
                placeholder="tipo documento"
              >
                <option value="" key="-1"></option>
                {props.tipiDoc
                  .filter((tipoDoc) => tipoDoc)
                  .map((tipoDoc, index) => (
                    <option value={tipoDoc} key={index} disabled={!!props.readOnlyForm}>
                      {tipoDoc}
                    </option>
                  ))}
              </select>
              <label htmlFor="tdoc">tipo documento</label>
            </div>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="ndoc"
                value={props.badgeForm.ndoc}
                onChange={props.handleInputChanges}
                name="ndoc"
                placeholder="num documento"
                readOnly={!!props.readOnlyForm}
                autoComplete="off"
              />
              <label htmlFor="ndoc">num documento</label>
            </div>
          </div>
          {props.badgeForm.tipo === TipoBadge.BADGE ? (
            <div className="row">
              <div className="form-floating col-sm-3">
                <input
                  type="number"
                  min="0"
                  max="24"
                  className="form-control form-control-sm"
                  id="scadenza"
                  value={props.badgeForm.scadenza}
                  onChange={props.handleInputChanges}
                  name="scadenza"
                  placeholder="scadenza"
                  readOnly={!!props.readOnlyForm}
                  autoComplete="off"
                />
                <label htmlFor="scadenza">scadenza (mesi)</label>
              </div>
            </div>
          ) : (
            props.badgeForm.tipo === TipoBadge.VEICOLO && (
              <div>
                <div className="row">
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="targa1"
                      value={props.badgeForm.targa1}
                      onChange={props.handleInputChanges}
                      name="targa1"
                      placeholder="targa1"
                      readOnly={!!props.readOnlyForm}
                      autoComplete="off"
                    />
                    <label htmlFor="targa1">targa1</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="targa2"
                      value={props.badgeForm.targa2}
                      onChange={props.handleInputChanges}
                      name="targa2"
                      placeholder="targa2"
                      readOnly={!!props.readOnlyForm}
                    />
                    <label htmlFor="targa2">targa2</label>
                  </div>
                </div>
                <div className="row">
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="targa3"
                      value={props.badgeForm.targa3}
                      onChange={props.handleInputChanges}
                      name="targa3"
                      placeholder="targa3"
                      readOnly={!!props.readOnlyForm}
                      autoComplete="off"
                    />
                    <label htmlFor="targa3">targa3</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="targa4"
                      value={props.badgeForm.targa4}
                      onChange={props.handleInputChanges}
                      name="targa4"
                      placeholder="targa4"
                      readOnly={!!props.readOnlyForm}
                      autoComplete="off"
                    />
                    <label htmlFor="targa4">targa4</label>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <div className="row">
        <div className="input-group col-sm-3">
          <input
            accept="image/*"
            type="file"
            className="custom-file-input"
            id="pfp"
            onChange={props.handleInputFileChanges}
            name="pfp"
            disabled={props.readOnlyForm === true || props.admin === false}
            autoComplete="off"
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default BadgeForm;
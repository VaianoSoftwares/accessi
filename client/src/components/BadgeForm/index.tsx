/* eslint-disable react-hooks/exhaustive-deps */
// Modules
import React from "react";
import dateFormat from "dateformat";
// Style
import "./index.css";
// Components
import { BadgeFormState } from "../../types/BadgeFormState";
// Types
import { TipoBadge } from "../../enums/TipoBadge";
import { StatoBadge } from "../../enums/StatoBadge";
import { Assegnazione } from "../../types/Assegnazione";
import { ArchivioFormState } from "../../types/ArchivioFormState";

type Props = {
  badgeForm: BadgeFormState;
  archivioForm: ArchivioFormState;
  handleInputChanges: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleInputFileChanges: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChangesArchivio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tipiBadge: TipoBadge[];
  assegnazioni: Assegnazione[];
  tipiDoc: string[];
  statiBadge: StatoBadge[];
  readOnlyForm: boolean;
  admin: boolean;
  pfpUrl: string;
};

const BadgeForm: React.FC<Props> = (props: Props) => {
  return (
    <div className="col-9 badge-form">
      <div className="row mb-2">
        <div className="form-floating col-sm-2">
          <input
            type="date"
            className="form-control form-control-sm"
            id="dataInizio"
            value={props.archivioForm.dataInizio}
            onChange={props.handleInputChangesArchivio}
            name="dataInizio"
            readOnly={!!props.readOnlyForm}
            autoComplete="off"
          />
          <label htmlFor="dataInizio">resoconto inizio</label>
        </div>
        <div className="form-floating col-sm-2">
          <input
            type="date"
            className="form-control form-control-sm"
            id="dataFine"
            value={props.archivioForm.dataFine}
            onChange={props.handleInputChangesArchivio}
            name="dataFine"
            readOnly={!!props.readOnlyForm}
            autoComplete="off"
          />
          <label htmlFor="dataFine">resoconto fine</label>
        </div>
        <div className="w-100 mb-1"></div>
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
        <div className="form-floating col-sm-5">
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
        <div className="w-100"></div>
        <div className="form-floating col-sm-2">
          <select
            className="form-select form-select-sm"
            id="tipo"
            value={props.badgeForm.tipo}
            onChange={props.handleInputChanges}
            name="tipo"
            placeholder="tipo"
          >
            {props.tipiBadge.map((tipo, index) => (
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
            {props.assegnazioni
              .filter(
                (assegnaz) =>
                  assegnaz.badge === props.badgeForm.tipo && assegnaz.name
              )
              .map((assegnaz, index) => (
                <option
                  value={assegnaz.name}
                  key={index}
                  disabled={!!props.readOnlyForm}
                >
                  {assegnaz.name}
                </option>
              ))}
          </select>
          <label htmlFor="assegnazione">assegnazione</label>
        </div>
        <div className="w-100"></div>
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
            {props.statiBadge.map((stato, index) => (
              <option value={stato} key={index} disabled={!!props.readOnlyForm}>
                {stato}
              </option>
            ))}
          </select>
          <label htmlFor="stato">stato</label>
        </div>
        <div className="form-floating col-sm-5">
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
      <div className="row mt-2">
        <div className="col-2">
          <div
            className="pfp-container"
            style={{ backgroundImage: `url(${props.pfpUrl})` }}
          />
          <div className="input-group input-group-sm">
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
        <div className="col-10">
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
            <div className="w-100"></div>
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
            <div className="w-100"></div>
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
                    <option
                      value={tipoDoc}
                      key={index}
                      disabled={!!props.readOnlyForm}
                    >
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
            <div className="w-100"></div>
            {props.badgeForm.tipo === TipoBadge.BADGE ? (
              <>
                <div className="form-floating col-sm-3">
                  <input
                    type="date"
                    min={dateFormat(new Date(), "yyyy-mm-dd")}
                    className="form-control form-control-sm"
                    id="scadenza"
                    value={props.badgeForm.scadenza}
                    onChange={props.handleInputChanges}
                    name="scadenza"
                    readOnly={!!props.readOnlyForm}
                    autoComplete="off"
                  />
                  <label htmlFor="scadenza">scadenza</label>
                </div>
                <div className="w-100"></div>
              </>
            ) : (
              props.badgeForm.tipo === TipoBadge.VEICOLO && (
                <>
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
                  <div className="w-100"></div>
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
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeForm;

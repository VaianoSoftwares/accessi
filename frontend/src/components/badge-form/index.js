/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import "./index.css";
import BadgeDataService from "../../services/badge.js";

const BadgeForm = props => {
  const [tipi, setTipi] = React.useState([]);
  const [assegnazioni, setAssegnazioni] = React.useState([]);
  const [stati, setStati] = React.useState([]);

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

  const renderPfp = (event) => {
    props.handleInputFileChanges(event);
    const pfp = document.querySelector("img.pfp");
    const { files } = event.target;
    pfp.src = files[0]
      ? window.URL.createObjectURL(files[0])
      : window.env.DEFAULT_IMG;
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
            readOnly={Boolean(props.readOnlyForm)}
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
            readOnly={Boolean(props.readOnlyForm)}
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
              <option value={assegnaz} key={index} disabled={Boolean(props.readOnlyForm)}>
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
              <option value={stato} key={index} disabled={Boolean(props.readOnlyForm)}>
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
            readOnly={Boolean(props.readOnlyForm)}
          />
          <label htmlFor="ubicazione">ubicazione</label>
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col-2 pfp-container" align="center">
          <img
            alt="foto profilo"
            src={window.env.DEFAULT_IMG}
            className="pfp"
            onError={props.setPfp()}
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
                readOnly={Boolean(props.readOnlyForm)}
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
                readOnly={Boolean(props.readOnlyForm)}
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
                readOnly={Boolean(props.readOnlyForm)}
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
                readOnly={Boolean(props.readOnlyForm)}
              />
              <label htmlFor="telefono">telefono</label>
            </div>
          </div>
          <div className="row">
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="tipo_doc"
                value={props.badgeForm.tipo_doc || ""}
                onChange={props.handleInputChanges}
                name="tipo_doc"
                placeholder="tipo documento"
              >
                <option value="" key="-1"></option>
                {props.tipiDoc
                  .filter((tipoDoc) => tipoDoc)
                  .map((tipoDoc, index) => (
                    <option value={tipoDoc} key={index} disabled={Boolean(props.readOnlyForm)}>
                      {tipoDoc}
                    </option>
                  ))}
              </select>
              <label htmlFor="tipo_doc">tipo documento</label>
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
                readOnly={Boolean(props.readOnlyForm)}
              />
              <label htmlFor="ndoc">num documento</label>
            </div>
          </div>
          {props.badgeForm.tipo === "badge" ? (
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
                  readOnly={Boolean(props.readOnlyForm)}
                />
                <label htmlFor="scadenza">scadenza (mesi)</label>
              </div>
            </div>
          ) : (
            props.badgeForm.tipo === "veicolo" && (
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
                      readOnly={Boolean(props.readOnlyForm)}
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
                      readOnly={Boolean(props.readOnlyForm)}
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
                      readOnly={Boolean(props.readOnlyForm)}
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
                      readOnly={Boolean(props.readOnlyForm)}
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
            type="file"
            className="custom-file-input"
            id="foto_profilo"
            value={props.badgeForm.fotoProfilo}
            onChange={renderPfp}
            name="foto_profilo"
            placeholder="foto profilo"
            disabled={props.readOnlyForm === true || props.admin === false}
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default BadgeForm;
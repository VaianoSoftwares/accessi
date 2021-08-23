import React from "react";

import BadgeDataService from "../services/badge.js";

const BadgeForm = props => {
  const [tipi, setTipi] = React.useState([]);
  const [assegnazioni, setAssegnazioni] = React.useState([]);
  const [stati, setStati] = React.useState([]);
  const [tipiDoc, setTipiDoc] = React.useState([]);

  React.useEffect(() => {
    BadgeDataService.token = props.token;
    retriveTipi();
    retriveAssegnazioni();
    retriveStati();
    retriveTipiDoc();
  }, []);

  const retriveTipi = () => {
    BadgeDataService.getTipiBadge()
      .then(response => {
        console.log(response.data);
        setTipi(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const retriveAssegnazioni = () => {
    BadgeDataService.getAssegnazioni(props.badgeForm.tipo)
      .then(response => {
        console.log(response.data);
        setAssegnazioni(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const retriveStati = () => {
    BadgeDataService.getStati()
      .then(response => {
        console.log(response.data);
        setStati(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const retriveTipiDoc = () => {
    BadgeDataService.getTipiDoc()
      .then((response) => {
        console.log(response.data);
        setTipiDoc(response.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const renderPfp = (event) => {
    props.handleInputFileChanges(event);
    const pfp = document.querySelector("div.badge-form img");
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
            readOnly
          >
            {tipi.map((tipo, index) => (
              <option value={tipo} key={index}>
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
            value={props.badgeForm.assegnazione}
            onChange={props.handleInputChanges}
            name="assegnazione"
            placeholder="assegnazione"
          >
            {assegnazioni.map((assegnazione, index) => (
              <option value={assegnazione} key={index}>
                {assegnazione}
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
            value={props.badgeForm.stato}
            onChange={props.handleInputChanges}
            name="stato"
            placeholder="stato"
          >
            {stati.map((stato, index) => (
              <option value={stato} key={index}>
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
          />
          <label htmlFor="stato">stato</label>
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col-2 pfp-container" align="center">
          <img
            alt="foto profilo"
            src={window.env.DEFAULT_IMG}
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
              />
              <label htmlFor="telefono">telefono</label>
            </div>
          </div>
          <div className="row">
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="tipo_doc"
                value={props.badgeForm.tipo_doc}
                onChange={props.handleInputChanges}
                name="tipo_doc"
                placeholder="tipo documento"
              >
                {tipiDoc.map((tipoDoc, index) => (
                  <option value={tipoDoc} key={index}>
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
              />
              <label htmlFor="ndoc">num documento</label>
            </div>
          </div>
          {props.badgeForm.tipo === "badge" ? (
            <div className="row">
              <div className="form-floating col-sm-3">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="scadenza"
                  value={props.badgeForm.scadenza}
                  onChange={props.handleInputChanges}
                  name="scadenza"
                  placeholder="scadenza"
                />
                <label htmlFor="scadenza">scadenza</label>
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
        <div className="form-group col-sm-3">
          <input
            type="file"
            className="form-control-file form-control-file-sm"
            id="foto_profilo"
            value={props.badgeForm.fotoProfilo}
            onChange={renderPfp}
            name="foto_profilo"
            placeholder="foto profilo"
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default BadgeForm;
import React from "react";
import BadgeDataService from "../services/badge.js";

const NomForm = props => {
  const [tipiDoc, setTipiDoc] = React.useState([]);
  const [isNomCheckbox, setIsNomCheckbox] = React.useState(true);

  React.useEffect(() => {
    BadgeDataService.token = props.token;
    retriveTipiDoc();
  }, []);

  const retriveTipiDoc = () => {
    BadgeDataService.getTipiDoc()
      .then(response => {
        console.log(response.data)
        setTipiDoc(response.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const checkboxHandler = () => {
    setIsNomCheckbox(!isNomCheckbox);
    const inputs = document.querySelectorAll(".nom-form input:not(#is_nom)");
    inputs.forEach(input => {
      input.disabled = isNomCheckbox;
    });
  };

  return (
    <div className="nom-form">
      <div className="form-check">
        <label htmlFor="is_nom" className="form-check-label">nominativo</label>
        <input
          type="checkbox"
          className="form-check-input"
          id="is_nom"
          checked={isNomCheckbox}
          onChange={checkboxHandler}
        />
      </div>
      <div className="form-group col-md-3">
        <label htmlFor="nome">nome</label>
        <input
          type="text"
          className="form-control"
          id="nome"
          value={props.badgeForm.nome}
          onChange={props.handleInputChanges}
          name="nome"
        />
      </div>
      <div className="form-group col-md-3">
        <label htmlFor="cognome">cognome</label>
        <input
          type="text"
          className="form-control"
          id="cognome"
          value={props.badgeForm.cognome}
          onChange={props.handleInputChanges}
          name="cognome"
        />
      </div>
      <div className="p-3 mw-25 mh-25">
        <img 
          alt="foto profilo" 
          src={window.env.DEFAULT_IMG} 
          className="d-inline-block img-thumbnail float-left" 
        />
      </div>
      <div className="form-group col-md-3">
        <label htmlFor="rag_soc">ragione sociale</label>
        <input
          type="text"
          className="form-control"
          id="rag_soc"
          value={props.badgeForm.rag_soc}
          onChange={props.handleInputChanges}
          name="rag_soc"
        />
      </div>
      <div className="form-group col-md-3">
        <label htmlFor="num_tel">numero telefono</label>
        <input
          type="text"
          className="form-control"
          id="num_tel"
          value={props.badgeForm.num_tel}
          onChange={props.handleInputChanges}
          name="num_tel"
        />
      </div>
      <div className="form-group col-md-3">
        <label htmlFor="tipo_doc">tipo documento</label>
        <select
          className="form-control"
          id="tipo_doc"
          value={props.badgeForm.tipo_doc}
          onChange={props.handleInputChanges}
          name="tipo_doc"
        >
        {tipiDoc.map((tipoDoc, index) => (
          <option value={tipoDoc} key={index}>
            {tipoDoc}
          </option>
        ))}
        </select>
      </div>
      <div className="form-group col-md-3">
        <label htmlFor="cod_doc">codice documento</label>
        <input
          type="text"
          className="form-control"
          id="cod_doc"
          value={props.badgeForm.cod_doc}
          onChange={props.handleInputChanges}
          name="cod_doc"
        />
      </div>
      <div className="form-group col-md-3">
        <label htmlFor="foto_profilo">foto profilo</label>
        <input
          type="file"
          className="form-control-file"
          id="foto_profilo"
          value={props.badgeForm.fotoProfilo}
          onChange={event => {
            props.handleInputChanges(event);
            const pfp = document.querySelector("div.nom-form img");
            const { files } = event.target;
            pfp.src = files[0] ? window.URL.createObjectURL(files[0]) : window.env.DEFAULT_IMG;
          }}
          name="foto_profilo"
        />
      </div>
    </div>
  );
};

export default NomForm;
import React from "react";
import DocumentsDataService from "../../services/docs";
import { Nullable } from "../../types/Nullable";
import { TAlert } from "../../types/TAlert";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import createFormData from "../../utils/createFormData";
import { TDocumento, DocFormState } from "../../types/Documento";
import BadgeTable from "../BadgeTable";
import handleInputChanges from "../../utils/handleInputChanges";
import "./index.css";
import Alert from "../Alert";

type Props = {
  alert: Nullable<TAlert>;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
  admin: boolean;
};

const Documenti: React.FC<Props> = (props: Props) => {
  const initialDocFormState: DocFormState = {
    codice: "",
    azienda: "",
    nome: "",
    cognome: "",
    docimg: null,
  };

  const [documenti, setDocumenti] = React.useState<TDocumento[]>([]);
  const [docFindView, setDocFindView] = React.useState<TDocumento[]>([]);
  const [docForm, setDocForm] = React.useState<DocFormState>(initialDocFormState);
  const [docImgUrl, setDocImgUrl] = React.useState("");

  React.useEffect(() => retriveDocumenti(), []);

  React.useEffect(() => {
    if(docForm.docimg) {
      const reader = new FileReader();
      reader.readAsDataURL(docForm.docimg);
      reader.onload = () => setDocImgUrl(reader.result as string);
    }
    else {
      setDocImgUrl("");
    }
  }, [docForm.docimg]);

  const retriveDocumenti = () => {
    DocumentsDataService.getAll()
      .then(response => {
        console.log("retriveDocumenti | response: ", response.data);
        setDocumenti(response.data.data as TDocumento[]);
      })
      .catch(err => {
        console.error("retriveDocumenti | error: ", err);
      });
  };

  const findDocumenti = () => {
    const filteredDocs = documentiFilter(docForm);
    console.log("findDocumenti | filteredDocs: ", filteredDocs);

    setDocFindView(filteredDocs);

    if (filteredDocs.length === 1) {
      const { filename } = filteredDocs[0];
      const url = getDocImgUrlByCodice(filename);
      setDocImgUrl(url);

      setDocForm(mapToDocFormState(filteredDocs[0]));
    }

    props.closeAlert();
  };

  const insertDocumento = () => {
    const formData = createFormData(docForm);
    DocumentsDataService.insertDoc(formData)
      .then(response => {
        console.log("insertDocumento | response: ", response.data);

        const addedDoc = response.data.data as TDocumento;
        setDocumenti(prevState => [...prevState, addedDoc]);

        const { success, msg } = response.data;
        props.openAlert({ success, msg });
      })
      .catch(err => axiosErrHandl(err, props.openAlert, "insertDocumento | "))
      .finally(() => refreshPage());
  };

  const updateDocumento = () => {
    const confirmed = window.confirm("Procedere alla modifica del documento?");
		if(!confirmed) return;

    const formData = createFormData(docForm);
    DocumentsDataService.updateDoc(formData)
      .then(response => {
        console.log("updateDocumento | response: ", response.data);

        const updatedDoc = response.data.data as TDocumento;
        setDocumenti((prevState) =>
          prevState.map((doc) =>
            doc.codice === updatedDoc.codice ? updatedDoc : doc
          )
        );

        const { success, msg } = response.data;
        props.openAlert({ success, msg });
      })
      .catch(err => axiosErrHandl(err, props.openAlert, "updateDocumento | "))
      .finally(() => refreshPage());
  };

  const deleteDocumento = () => {
    const confirmed = window.confirm("Procedere alla rimozione del documento?");
		if(!confirmed) return;

    DocumentsDataService.deleteDoc(docForm.codice)
      .then(response => {
        console.log("deleteDocumento | response: ", response.data);

        const deletedDoc = response.data.data as TDocumento;
        setDocumenti((prevState) =>
          prevState.filter((doc) => doc.codice !== deletedDoc.codice)
        );

        const { success, msg } = response.data;
        props.openAlert({ success, msg });
      })
      .catch(err => axiosErrHandl(err, props.openAlert, "deleteDocumento | "))
      .finally(() => refreshPage());
  };

  const refreshPage = (closePopup = false) => {
    setDocForm(initialDocFormState);
    setDocImgUrl("");
    setDocFindView([]);
    if(closePopup)
      props.closeAlert();
  };

  const documentiFilter = (form: DocFormState) =>
    documenti.filter(doc => 
      (form.codice && doc.codice.includes(form.codice.toUpperCase())) ||
      (form.azienda && doc.azienda.includes(form.azienda.toUpperCase())) ||
      (form.nome && doc.nome.includes(form.nome.toUpperCase())) ||
      (form.cognome && doc.cognome.includes(form.cognome.toUpperCase()))
    );

  const getDocImgUrlByCodice = (filename = "") =>
    filename ? `/api/v1/public/documenti/${filename}` : "";

  const mapToDocFormState = (doc: TDocumento): DocFormState => ({
    codice: doc.codice,
    azienda: doc.azienda,
    nome: doc.nome,
    cognome: doc.cognome,
    docimg: null,
  });

  return (
    <div id="doc-wrapper">
      <div className="container-fluid mb-3">
        <div className="row mt-2 mx-1 justify-content-start align-items-start submit-form">
          <div className="col-2 p-0">
            <div className="row">
              <div
                className="col doc-img-container"
                style={{ backgroundImage: `url(${docImgUrl})` }}
              />
              <div className="w-100 mb-1" />
              <div className="col">
                <div className="input-group input-group-sm">
                  <input
                    accept="image/*"
                    type="file"
                    className="custom-file-input"
                    id="docimg"
                    onChange={(e) => handleInputChanges(e, docForm, setDocForm)}
                    name="docimg"
                    disabled={props.admin === false}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-8 p-0 doc-form">
            <div className="row mb-1">
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="codice"
                  value={docForm.codice}
                  onChange={(e) => handleInputChanges(e, docForm, setDocForm)}
                  name="codice"
                  placeholder="numero documento"
                  autoComplete="off"
                />
                <label htmlFor="codice">ndoc</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="azienda"
                  value={docForm.azienda}
                  onChange={(e) => handleInputChanges(e, docForm, setDocForm)}
                  name="azienda"
                  placeholder="azienda"
                  autoComplete="off"
                />
                <label htmlFor="azienda">azienda</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="nome"
                  value={docForm.nome}
                  onChange={(e) => handleInputChanges(e, docForm, setDocForm)}
                  name="nome"
                  placeholder="nome"
                  autoComplete="off"
                />
                <label htmlFor="nome">nome</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cognome"
                  value={docForm.cognome}
                  onChange={(e) => handleInputChanges(e, docForm, setDocForm)}
                  name="cognome"
                  placeholder="cognome"
                  autoComplete="off"
                />
                <label htmlFor="cognome">cognome</label>
              </div>
            </div>
          </div>
          <div className="col-1 p-0">
            <div className="row align-items-center justify-content-start g-0">
              <div className="col">
                <button
                  className="btn btn-success home-form-btn"
                  onClick={() => findDocumenti()}
                >
                  Cerca
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success home-form-btn"
                  onClick={() => insertDocumento()}
                  disabled={props.admin === false}
                >
                  Aggiungi
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success home-form-btn"
                  onClick={() => updateDocumento()}
                  disabled={props.admin === false}
                >
                  Modifica
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success home-form-btn"
                  onClick={() => deleteDocumento()}
                  disabled={props.admin === false}
                >
                  Elimina
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success home-form-btn"
                  onClick={() => refreshPage(true)}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="doc-alert-wrapper">
          <Alert alert={props.alert} closeAlert={props.closeAlert} />
        </div>
      </div>
      <div id="doc-table-wrapper">
        <BadgeTable content={docFindView} />
      </div>
    </div>
  );
};

export default Documenti;

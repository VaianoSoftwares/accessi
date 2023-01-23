import React from "react";
import DocumentsDataService from "../../services/docs";
import { TAlert } from "../../types/TAlert";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TDocumento } from "../../types/Documento";
import BadgeTable from "../BadgeTable";
import "./index.css";
import Alert from "../Alert";

type Props = {
  alert: TAlert | null;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
  admin: boolean;
};

const Documenti: React.FC<Props> = (props: Props) => {
  const [documenti, setDocumenti] = React.useState<TDocumento[]>([]);
  const [docFindView, setDocFindView] = React.useState<TDocumento[]>([]);
  const [docImgUrl, setDocImgUrl] = React.useState("");

  const codiceRef = React.useRef<HTMLInputElement>(null);
  const aziendaRef = React.useRef<HTMLInputElement>(null);
  const nomeRef = React.useRef<HTMLInputElement>(null);
  const cognomeRef = React.useRef<HTMLInputElement>(null);
  const docimgRef = React.useRef<HTMLInputElement>(null);

  function clearForm() {
    codiceRef.current!.value = codiceRef.current!.defaultValue;
    aziendaRef.current!.value = aziendaRef.current!.defaultValue;
    nomeRef.current!.value = nomeRef.current!.defaultValue;
    cognomeRef.current!.value = cognomeRef.current!.defaultValue;
    docimgRef.current!.files = null;
  }

  function createFormData() {
    const data = new FormData();
    data.append("codice", codiceRef.current!.value);
    data.append("azienda", aziendaRef.current!.value);
    data.append("nome", nomeRef.current!.value);
    data.append("cognome", cognomeRef.current!.value);
    const doc = docimgRef.current?.files?.item(0)
    doc && data.append("docimg", doc);
    return data;
  }

  function setForm(obj: TDocumento) {
    codiceRef.current!.value = obj.codice;
    aziendaRef.current!.value = obj.azienda;
    nomeRef.current!.value = obj.nome;
    cognomeRef.current!.value = obj.cognome;
    docimgRef.current!.files = null;
  }

  function retriveDocumenti() {
    DocumentsDataService.getAll()
      .then(response => {
        console.log("retriveDocumenti | response: ", response.data);
        setDocumenti(response.data.data as TDocumento[]);
      })
      .catch(err => {
        console.error("retriveDocumenti | error: ", err);
      });
  }

  function findDocumenti() {
    const filteredDocs = documentiFilter();
    console.log("findDocumenti | filteredDocs: ", filteredDocs);

    setDocFindView(filteredDocs);

    if (filteredDocs.length === 1) {
      const { filename } = filteredDocs[0];
      const url = getDocImgUrlByCodice(filename);
      setDocImgUrl(url);

      setForm(filteredDocs[0]);
    }

    props.closeAlert();
  }

  function insertDocumento() {
    DocumentsDataService.insert(createFormData())
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

  function updateDocumento() {
    const confirmed = window.confirm("Procedere alla modifica del documento?");
		if(!confirmed) return;

    DocumentsDataService.update(createFormData())
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

  function deleteDocumento() {
    const confirmed = window.confirm("Procedere alla rimozione del documento?");
		if(!confirmed) return;

    DocumentsDataService.delete(codiceRef.current!.value)
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
  }

  function documentiFilter() {
    return documenti.filter(
      (doc) =>
        (codiceRef.current!.value &&
          doc.codice.includes(codiceRef.current!.value!.toUpperCase())) ||
        (aziendaRef.current!.value &&
          doc.azienda.includes(aziendaRef.current!.value!.toUpperCase())) ||
        (nomeRef.current!.value &&
          doc.nome.includes(nomeRef.current!.value!.toUpperCase())) ||
        (cognomeRef.current!.value &&
          doc.cognome.includes(cognomeRef.current!.value!.toUpperCase()))
    );
  }

  function updateImgPreview(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setDocImgUrl(reader.result as string);
  }

  function getDocImgUrlByCodice(filename = "") {
    return filename ? `/api/v1/public/documenti/${filename}` : "";
  }

  function refreshPage(closePopup = false) {
    clearForm();
    setDocImgUrl("");
    setDocFindView([]);
    if(closePopup)
      props.closeAlert();
  }

  React.useEffect(() => retriveDocumenti(), []);

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
                    onChange={(e) => {
                      const file = e.target.files?.item(0);
                      if(file) updateImgPreview(file);
                      else setDocImgUrl("");
                    }}
                    disabled={props.admin === false}
                    autoComplete="off"
                    ref={docimgRef}
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
                  placeholder="numero documento"
                  autoComplete="off"
                  ref={codiceRef}
                  defaultValue=""
                />
                <label htmlFor="codice">ndoc</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="azienda"
                  placeholder="azienda"
                  autoComplete="off"
                  ref={aziendaRef}
                  defaultValue=""
                />
                <label htmlFor="azienda">azienda</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="nome"
                  placeholder="nome"
                  autoComplete="off"
                  ref={nomeRef}
                  defaultValue=""
                />
                <label htmlFor="nome">nome</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cognome"
                  placeholder="cognome"
                  autoComplete="off"
                  ref={cognomeRef}
                  defaultValue=""
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

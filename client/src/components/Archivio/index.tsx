import React from "react";
import { TArchivioChiave } from "../../types/PrestitoChiavi";
import { TArchTableContent } from "../../types/TableContentElem";
import { TableContentMapper } from "../../utils/tableContentMapper";
import BadgeDataService from "../../services/badge";
import "./index.css";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import { TEvent } from "../../types/TEvent";
import handleInputChanges from "../../utils/handleInputChanges";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import { TAssegnaz } from "../../types/TAssegnaz";

type Props = {
  assegnazioni: TAssegnaz[];
};

type TArchForm = {
  cliente: string;
  postazione: string;
  nominativo: string;
  assegnazione: string;
  nome: string;
  cognome: string;
  chiave: string;
  descrizione: string;
  dataInizio: string;
  dataFine: string;
};

const initArchForm: TArchForm = {
  cliente: "",
  postazione: "",
  nominativo: "",
  assegnazione: "",
  nome: "",
  cognome: "",
  chiave: "",
  descrizione: "",
  dataInizio: dateFormat(
    new Date(new Date().setDate(new Date().getDate() - 1)),
    "yyyy-mm-dd"
  ),
  dataFine: dateFormat(
    new Date(new Date().setDate(new Date().getDate() + 1)),
    "yyyy-mm-dd"
  ),
};

const Archivio: React.FC<Props> = (props) => {
  const [archivio, setArchivio] = React.useState<TArchTableContent[] | TArchivioChiave[]>(
    []
  );
  const [archForm, setArchForm] = React.useState<TArchForm>(initArchForm);

  const findArchivioBadge = () => {
    BadgeDataService.getArchivio(archForm)
      .then(response => {
        console.log(response.data);
        const archResponse = response.data.data as TArchivioChiave[];
        TableContentMapper.parseDate(archResponse);
        setArchivio(archResponse);
      })
      .catch(err => console.error("findArchivio |", err));
  };

  const findArchivioChiavi = () => {
    BadgeDataService.getArchivioChiavi(archForm)
      .then(response => {
        console.log(response.data);
        const archResponse = response.data.data as TArchTableContent[];
        TableContentMapper.parseDate(archResponse);
        setArchivio(archResponse);
      })
      .catch(err => console.error("findArchivio |", err));
  };

  const handleInputChangesArch = (e: TEvent) => {
    handleInputChanges(e, archForm, setArchForm);
  };

  React.useEffect(() => {
    findArchivioBadge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="archivio-wrapper">
      <div className="container-fluid mb-5 chiavi-container">
        <div className="row mt-2 archivio-form">
          <div className="col">
            <div className="row">
              <div className="form-floating col-sm-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataInizio"
                  value={archForm.dataInizio}
                  onChange={handleInputChangesArch}
                  name="dataInizio"
                  autoComplete="off"
                />
                <label htmlFor="dataInizio">resoconto inizio</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataFine"
                  value={archForm.dataFine}
                  onChange={handleInputChangesArch}
                  name="dataFine"
                  autoComplete="off"
                />
                <label htmlFor="dataFine">resoconto fine</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cliente"
                  value={archForm.cliente}
                  onChange={handleInputChangesArch}
                  name="cliente"
                  autoComplete="off"
                />
                <label htmlFor="cliente">cliente</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="postazione"
                  value={archForm.postazione}
                  onChange={handleInputChangesArch}
                  name="postazione"
                  autoComplete="off"
                />
                <label htmlFor="postazione">postazione</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="nominativo"
                  value={archForm.nominativo}
                  onChange={handleInputChangesArch}
                  name="nominativo"
                  autoComplete="off"
                />
                <label htmlFor="nominativo">badge</label>
              </div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="assegnazione"
                  value={archForm.assegnazione || ""}
                  onChange={handleInputChangesArch}
                  name="assegnazione"
                  placeholder="assegnazione"
                >
                  <option value="" key="-1"></option>
                  {props.assegnazioni
                    .filter(({ name }) => name)
                    .map(({ name }, index) => (
                      <option value={name} key={index}>
                        {name}
                      </option>
                    ))}
                </select>
                <label htmlFor="assegnazione">assegnazione</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="nome"
                  value={archForm.nome}
                  onChange={handleInputChangesArch}
                  name="nome"
                  autoComplete="off"
                />
                <label htmlFor="nome">nome</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cognome"
                  value={archForm.cognome}
                  onChange={handleInputChangesArch}
                  name="cognome"
                  autoComplete="off"
                />
                <label htmlFor="cognome">cognome</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="chiave"
                  value={archForm.chiave}
                  onChange={handleInputChangesArch}
                  name="chiave"
                  autoComplete="off"
                />
                <label htmlFor="chiave">chiave</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="descrizione"
                  value={archForm.descrizione}
                  onChange={handleInputChangesArch}
                  name="descrizione"
                  autoComplete="off"
                />
                <label htmlFor="descrizione">descrizione</label>
              </div>
            </div>
          </div>
          <div className="col-1">
            <div className="row">
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={() => findArchivioBadge()}
                >
                  Badge
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={() => findArchivioChiavi()}
                >
                  Chiavi
                </button>
              </div>
              <div className="w-100 mb-1" />
              <div className="col">
                <button
                  className="btn btn-success"
                  onClick={() => htmlTableToExcel("archivio-table")}
                >
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="archivio-table-wrapper">
        <BadgeTable content={archivio} tableId="archivio-table" />
      </div>
    </div>
  );
};

export default Archivio;
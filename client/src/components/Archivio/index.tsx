import React from "react";
import dateFormat from "dateformat";
import { Assegnazione } from "../../types/Assegnazione";
import { Nullable } from "../../types/Nullable";
import { TAlert } from "../../types/TAlert";
import { ArchivioFormState } from "../../types/ArchivioFormState";
import { TipoBadge } from "../../enums/TipoBadge";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import BadgeDataService from "../../services/badge";
import { GenericResponse } from "../../types/Responses";
import Alert from "../alert";

type Props = {
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
  assegnazioni: Assegnazione[];
};

type ArchivioTableContentElem = {
  codice: string;
  tipo: TipoBadge;
  assegnaz: string;
  nome: string;
  cognome: string;
  ditta: string;
  entrata: string;
  uscita: string;
};

const Archivio: React.FC<Props> = (props: Props) => {
  const initialArchivioFormState: ArchivioFormState = {
    dataInizio: dateFormat(
        new Date(new Date().setDate(new Date().getDate() - 1)),
        "yyyy-mm-dd"
    ),
    dataFine: dateFormat(new Date(), "yyyy-mm-dd"),
    assegnazione: "",
    nome: "",
    cognome: "",
    ditta: "",
  };

  const [archivioForm, setArchivioForm] = React.useState<ArchivioFormState>(
    initialArchivioFormState
  );
  const [archivioList, setArchivioList] = React.useState<ArchivioTableContentElem[]>([]);

  const handleInputChanges = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setArchivioForm({ ...archivioForm, [name]: value });
  };

  const retriveArchivio = () => {
    const { dataInizio, dataFine } = archivioForm;
    BadgeDataService.getArchivio({ inizio: dataInizio, fine: dataFine })
      .then(response => {
        const mappedArchivio = mapArchivioToTableContent(response.data.data);
        setArchivioList(mappedArchivio);
        htmlTableToExcel("archivio-table");
      })
      .catch(err => {
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data as GenericResponse;
          props.setAlert({ success, msg });
        }
      });
  };

  const mapArchivioToTableContent = (data: any[]) => {
    return data.map((elem: any) => {
      const mappedBadge: ArchivioTableContentElem = {
        codice: elem.barcode,
        tipo: elem.tipo,
        assegnaz: elem.assegnazione,
        nome: elem.nominativo ? elem.nominativo.nome : "",
        cognome: elem.nominativo ? elem.nominativo.cognome : "",
        ditta: elem.nominativo ? elem.nominativo.ditta : "",
        entrata: elem.data.entrata,
        uscita: elem.data.uscita
      };
      return mappedBadge;
    });
  };

  return (
    <>
      <div className="row">
        <h2>Resoconto Archivio</h2>
      </div>
      <div className="row mt-1">
        <div className="form-floating col-sm-3">
          <input
            type="date"
            className="form-control form-control-sm"
            id="dataInizio"
            value={archivioForm.dataInizio}
            onChange={handleInputChanges}
            name="dataInizio"
            autoComplete="off"
          />
          <label htmlFor="dataInizio">data inizio</label>
        </div>
        <div className="form-floating col-sm-3">
          <input
            type="date"
            className="form-control form-control-sm"
            id="dataFine"
            value={archivioForm.dataFine}
            onChange={handleInputChanges}
            name="dataFine"
            autoComplete="off"
          />
          <label htmlFor="dataFine">data fine</label>
        </div>
      </div>
      <div className="row mt-1">
        <div className="form-floating col-sm-3">
          <select
            className="form-select form-select-sm"
            id="assegnazione"
            value={archivioForm.assegnazione || ""}
            onChange={handleInputChanges}
            name="assegnazione"
            placeholder="assegnazione"
          >
            <option value="" key="-1"></option>
            {props.assegnazioni
              .filter((assegnaz) => assegnaz.badge === TipoBadge.BADGE && assegnaz.name)
              .map((assegnaz, index) => (
                <option value={assegnaz.name} key={index}>
                  {assegnaz.name}
                </option>
              ))}
          </select>
          <label htmlFor="assegnazione">assegnazione</label>
        </div>
        <div className="form-floating col-sm-3">
          <input
            type="text"
            className="form-control form-control-sm"
            id="ditta"
            value={archivioForm.ditta}
            onChange={handleInputChanges}
            name="ditta"
            placeholder="ditta"
            autoComplete="off"
          />
          <label htmlFor="ditta">ditta</label>
        </div>
      </div>
      <div className="row mt-1">
        <div className="form-floating col-sm-3">
          <input
            type="text"
            className="form-control form-control-sm"
            id="nome"
            value={archivioForm.nome}
            onChange={handleInputChanges}
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
            value={archivioForm.cognome}
            onChange={handleInputChanges}
            name="cognome"
            placeholder="cognome"
            autoComplete="off"
          />
          <label htmlFor="cognome">cognome</label>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col">
          <button className="btn btn-success" onClick={retriveArchivio}>
            Resoconto
          </button>
        </div>
      </div>
      <table id="archivio-table" hidden>
        <thead>
          <tr>
            {archivioList[0] &&
              Object.keys(archivioList[0]).map((key, index) => <th key={index}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {archivioList.map((archivioElem, index) => (
            <tr key={index}>
              {Object.values(archivioElem).map((value, _index) => (
                <td key={_index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Alert alert={props.alert} setAlert={props.setAlert} />
    </>
  );
};

export default Archivio;

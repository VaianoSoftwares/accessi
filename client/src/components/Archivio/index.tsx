import React from "react";
import { TArchivioChiave } from "../../types/PrestitoChiavi";
import { TArchTableContent } from "../../types/TableContentElem";
import { TableContentMapper } from "../../utils/tableContentMapper";
import BadgeDataService from "../../services/badge";
import "./index.css";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import { TPostazione } from "../../types/TPostazione";
import { TAssegnazione } from "../../types/TAssegnazione";

type Props = {
  assegnazioni: TAssegnazione[];
  clienti: string[];
  postazioni: TPostazione[];
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

const TABLE_ID = "archivio-table";

export default function Archivio(props: Props) {
  const clienteRef = React.useRef<HTMLSelectElement>(null);
  const postazioneRef = React.useRef<HTMLSelectElement>(null);
  const nominativoRef = React.useRef<HTMLInputElement>(null);
  const assegnazioneRef = React.useRef<HTMLSelectElement>(null);
  const nomeRef = React.useRef<HTMLInputElement>(null);
  const cognomeRef = React.useRef<HTMLInputElement>(null);
  const chiaveRef = React.useRef<HTMLInputElement>(null);
  const descrizioneRef = React.useRef<HTMLInputElement>(null);
  const dataInizioRef = React.useRef<HTMLInputElement>(null);
  const dataFineRef = React.useRef<HTMLInputElement>(null);

  const [archivio, setArchivio] = React.useState<
    TArchTableContent[] | TArchivioChiave[]
  >([]);

  function formToObj(): TArchForm {
    return {
      cliente: clienteRef.current!.value,
      postazione: postazioneRef.current!.value,
      nominativo: nominativoRef.current!.value,
      assegnazione: assegnazioneRef.current!.value,
      nome: nomeRef.current!.value,
      cognome: cognomeRef.current!.value,
      chiave: chiaveRef.current!.value,
      descrizione: descrizioneRef.current!.value,
      dataInizio: dataInizioRef.current!.value,
      dataFine: dataFineRef.current!.value,
    };
  }

  // function clearForm() {
  //   clienteRef.current!.value = clienteRef.current!.options!.item(0)!.value;
  //   postazioneRef.current!.value = postazioneRef.current!.options!.item(0)!.value;
  //   nominativoRef.current!.value = nominativoRef.current!.defaultValue;
  //   assegnazioneRef.current!.value = assegnazioneRef.current!.options!.item(0)!.value;
  //   nomeRef.current!.value = nomeRef.current!.defaultValue;
  //   cognomeRef.current!.value = cognomeRef.current!.defaultValue;
  //   chiaveRef.current!.value = chiaveRef.current!.defaultValue;
  //   descrizioneRef.current!.value = descrizioneRef.current!.defaultValue;
  //   dataInizioRef.current!.value = dataInizioRef.current!.defaultValue;
  //   dataFineRef.current!.value = dataFineRef.current!.defaultValue;
  // }

  function findArchivioBadge() {
    BadgeDataService.getArchivio(formToObj())
      .then((response) => {
        console.log(response.data);
        const archResponse = response.data.data as TArchivioChiave[];
        TableContentMapper.parseDate(archResponse);
        setArchivio(archResponse);
      })
      .catch((err) => console.error("findArchivio |", err));
  }

  function findArchivioChiavi() {
    BadgeDataService.getArchivioChiavi(formToObj())
      .then((response) => {
        console.log(response.data);
        const archResponse = response.data.data as TArchTableContent[];
        TableContentMapper.parseDate(archResponse);
        setArchivio(archResponse);
      })
      .catch((err) => console.error("findArchivio |", err));
  }

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
                  autoComplete="off"
                  ref={dataInizioRef}
                  defaultValue={dateFormat(
                    new Date(new Date().setDate(new Date().getDate() - 1)),
                    "yyyy-mm-dd"
                  )}
                />
                <label htmlFor="dataInizio">resoconto inizio</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  id="dataFine"
                  autoComplete="off"
                  ref={dataFineRef}
                  defaultValue={dateFormat(
                    new Date(new Date().setDate(new Date().getDate() + 1)),
                    "yyyy-mm-dd"
                  )}
                  min={dataInizioRef.current!.value}
                />
                <label htmlFor="dataFine">resoconto fine</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="cliente"
                  placeholder="cliente"
                  ref={clienteRef}
                  defaultValue=""
                >
                  <option value="" key="-1"></option>
                  {props.clienti
                    .filter((cliente) => cliente)
                    .map((cliente, index) => (
                      <option value={cliente} key={index}>
                        {cliente}
                      </option>
                    ))}
                </select>
                <label htmlFor="cliente">cliente</label>
              </div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="postazione"
                  placeholder="postazione"
                  ref={postazioneRef}
                  defaultValue=""
                >
                  <option value="" key="-1"></option>
                  {props.postazioni
                    .filter(({ name }) => name)
                    .map(({ name }, index) => (
                      <option value={name} key={index}>
                        {name}
                      </option>
                    ))}
                </select>
                <label htmlFor="postazione">postazione</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="nominativo"
                  autoComplete="off"
                  ref={nominativoRef}
                  defaultValue=""
                />
                <label htmlFor="nominativo">badge</label>
              </div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="assegnazione"
                  placeholder="assegnazione"
                  ref={assegnazioneRef}
                  defaultValue=""
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
                  autoComplete="off"
                  ref={nomeRef}
                  defaultValue=""
                />
                <label htmlFor="nome">nome</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cognome"
                  autoComplete="off"
                  ref={cognomeRef}
                  defaultValue=""
                />
                <label htmlFor="cognome">cognome</label>
              </div>
              <div className="w-100 mb-1" />
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="chiave"
                  autoComplete="off"
                  ref={chiaveRef}
                  defaultValue=""
                />
                <label htmlFor="chiave">chiave</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="descrizione"
                  autoComplete="off"
                  ref={descrizioneRef}
                  defaultValue=""
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
                  onClick={() => htmlTableToExcel(TABLE_ID)}
                >
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="archivio-table-wrapper">
        <BadgeTable content={archivio} tableId={TABLE_ID} />
      </div>
    </div>
  );
}
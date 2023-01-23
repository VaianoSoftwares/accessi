import { TInPrestito, TPrestitoDataRes } from "../../types/PrestitoChiavi";
import { TAlert } from "../../types/TAlert";
import Alert from "../Alert";
import BadgeDataService from "../../services/badge";
import "./index.css";
import React from "react";
import BadgeTable from "../BadgeTable";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TableContentMapper } from "../../utils/tableContentMapper";

type Props = {
  scannerConnected: boolean;
  runScanner: () => Promise<void>;
  scanValues: string[];
  addScanValue: (value: string) => void;
  removeScanValue: (value: string) => void;
  clearScanValues: () => void;
  alert: TAlert | null;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
};

const Chiavi: React.FC<Props> = (props: Props) => {
  const [inPrestito, setInPrestito] = React.useState<TInPrestito[]>([]);

  const barcodeTxtInput = React.useRef<HTMLInputElement>(null);

  function retriveInPrestito() {
    BadgeDataService.getInPrestito()
      .then((response) => {
        console.log("retriveInPrestito |", response.data);
        const dataResponse = response.data.data as TInPrestito[];
        TableContentMapper.parseDate(dataResponse);
        setInPrestito(dataResponse);
      })
      .catch((err) => {
        console.log("retriveInPrestito |", err);
      });
  }

  React.useEffect(() => {
    retriveInPrestito();
  }, []);

  const prestaChiavi = (barcodes: string[]) => {
    const dataReq = {
      barcodes,
      cliente: sessionStorage.getItem("cliente") as string,
      postazione: sessionStorage.getItem("postazione") as string,
    };

    BadgeDataService.prestaChiavi(dataReq)
      .then((response) => {
        console.log("prestaChiavi |", response.data);

        const { prestate, rese } = response.data.data as TPrestitoDataRes;
        TableContentMapper.parseDate(prestate);

        setInPrestito((prevState) =>
          [...prestate, ...prevState].filter((elem) => !rese.includes(elem.id))
        );

        props.clearScanValues();
      })
      .catch((err) => axiosErrHandl(err, props.openAlert, "prestaChiavi |"));
  };

  return (
    <div id="chiavi-wrapper">
      <div className="container-fluid mb-2 chiavi-container">
        <div className="row mt-2">
          <div className="col-1">
            <button
              className="btn btn-success"
              onClick={() => {
                const barcode = barcodeTxtInput?.current?.value;
                barcode && props.addScanValue(barcode);
              }}
            >
              Aggiungi
            </button>
          </div>
          <div className="col-sm-3">
            <input
              className="form-control-sm"
              ref={barcodeTxtInput}
              type="text"
            />
          </div>
          <div className="col-1" />
          <div className="col-2">
            <button
              className="btn btn-outline-secondary"
              onClick={async () => await props.runScanner()}
            >
              Scanner
            </button>{" "}
            <b
              style={
                props.scannerConnected ? { color: "green" } : { color: "red" }
              }
            >
              {!props.scannerConnected && "Non "}
              {"Connesso"}
            </b>
          </div>
          <div className="w100 mt-1" />
          <div className="barcode-list col-3">
            <ul className="list-group list-group-flush">
              {props.scanValues.map((barcode, i) => (
                <li className="list-group-item" key={i}>
                  <button
                    type="button"
                    className="close btn-del-barcode"
                    aria-label="Close"
                    onClick={() => props.removeScanValue(barcode)}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>{" "}
                  {barcode}
                </li>
              ))}
            </ul>
          </div>
          <div className="w100 mt-1" />
          <div className="col">
            <button
              className="btn btn-success"
              onClick={() => prestaChiavi(props.scanValues)}
            >
              Invio
            </button>
          </div>
          <div className="col-5" />
          <div className="chiavi-alert-wrapper col-auto">
            <Alert alert={props.alert} closeAlert={props.closeAlert} />
          </div>
        </div>
      </div>
      <BadgeTable content={inPrestito} />
    </div>
  );
};

export default Chiavi;

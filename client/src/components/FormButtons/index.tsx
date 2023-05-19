import htmlTableToExcel from "../../utils/htmlTableToExcel";
import "./index.css";
import BadgePopup from "../BadgePopup";
import { TTableContent } from "../../types";

export default function FormButtons(props: {
  findBadges: () => void;
  timbra: () => void;
  insertBadge: () => void;
  updateBadge: () => void;
  deleteBadge: () => void;
  openPopup: () => void;
  readonlyForm: boolean;
  toggleReadOnlyForm: () => void;
  admin: boolean;
  excel: boolean;
  provvisori: boolean;
  runScanner: () => Promise<void>;
  scannerConnected: boolean;
  badges: TTableContent[];
}) {
  return (
    <div className="form-buttons">
      <div className="row align-items-center justify-content-start g-0">
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary home-form-btn"
            id="serial-conn-btn"
            onClick={async () => await props.runScanner()}
          >
            Scanner
          </button>
        </div>
        <div className="col-auto mx-2 home-form-b">
          <b
            style={
              props.scannerConnected ? { color: "green" } : { color: "red" }
            }
          >
            {!props.scannerConnected && "Non "}
            {"Connesso"}
          </b>
        </div>
        <div className="w-100 mt-1" />
        {props.admin === true && (
          <>
            <div className="col-auto">
              <button
                onClick={() => props.toggleReadOnlyForm()}
                className="btn btn-success home-form-btn"
              >
                Form
              </button>
            </div>
            <div className="col-auto mx-2 home-form-b">
              <b
                style={
                  props.readonlyForm ? { color: "red" } : { color: "green" }
                }
              >
                {props.readonlyForm && "Non "}
                {"Attivo"}
              </b>
            </div>
            <div className="w-100 mt-1" />
          </>
        )}
        <div className="col">
          <button
            onClick={() => props.timbra()}
            className="btn btn-success home-form-btn"
          >
            Timbra
          </button>
        </div>
        <div className="w-100 mt-1" />
        {props.admin === true && (
          <>
            <div className="col">
              <BadgePopup
                content={props.badges}
                trigger={
                  <button className="btn btn-success home-form-btn">
                    Cerca
                  </button>
                }
                onOpen={props.findBadges}
                position="right top"
              />
            </div>
            <div className="w-100 mt-1" />
            <div className="col">
              <button
                onClick={() => props.insertBadge()}
                className="btn btn-success home-form-btn"
              >
                Aggiungi
              </button>
            </div>
            <div className="w-100 mt-1" />
            <div className="col">
              <button
                onClick={() => props.updateBadge()}
                className="btn btn-success home-form-btn"
              >
                Aggiorna
              </button>
            </div>
            <div className="w-100 mt-1" />
            <div className="col">
              <button
                onClick={() => props.deleteBadge()}
                className="btn btn-success home-form-btn"
              >
                Elimina
              </button>
            </div>
            <div className="w-100 mt-1" />
          </>
        )}
        {props.excel && (
          <div className="col">
            <button
              onClick={() => htmlTableToExcel("badge-table")}
              className="btn btn-success home-form-btn"
            >
              Excel
            </button>
          </div>
        )}
        <div className="w-100 mt-1" />
        {props.provvisori && (
          <div className="col">
            <button
              onClick={props.openPopup}
              className="btn btn-success home-form-btn"
            >
              Provvisori
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

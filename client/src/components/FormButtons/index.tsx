import React from "react";
import SerialComponent from "../serial-component";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import "./index.css";
import BadgePopup from "../BadgePopup";
import { ArchivioTableContent, TableContentElem } from "../../types/TableContentElem";

type Props = {
  findBadges: () => void;
  findArchivio: () => void;
  insertBadge: () => void;
  updateBadge: () => void;
  deleteBadge: () => void;
  refreshPage: () => void;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  readOnlyForm: boolean;
  setReadOnlyForm: React.Dispatch<React.SetStateAction<boolean>>;
  admin: boolean;
  setScannedValue: React.Dispatch<React.SetStateAction<string>>;
  badges: TableContentElem[];
  archivioList: ArchivioTableContent[];
};

const FormButtons: React.FC<Props> = (props: Props) => {
  const openPopup = () => props.setIsShown(true);

  return (
    <div className="form-buttons">
      <div className="row align-items-center justify-content-start g-0">
        <SerialComponent setScannedValue={props.setScannedValue} />
        <div className="w-100 mt-1"></div>
        <div className="col-auto">
          <button
            onClick={() => props.setReadOnlyForm(!props.readOnlyForm)}
            className="btn btn-success home-form-btn"
          >
            Form
          </button>
        </div>
        <div className="col-auto mx-2 home-form-b">
          <b style={props.readOnlyForm ? { color: "red" } : { color: "green" }}>
            {props.readOnlyForm && "Non "}
            {"Attivo"}
          </b>
        </div>
        <div className="w-100 mt-1"></div>
        <div className="col">
          <BadgePopup
            content={props.badges}
            trigger={
              <button className="btn btn-success home-form-btn">Cerca</button>
            }
            onOpen={props.findBadges}
            position="right top"
          />
        </div>
        <div className="w-100 mt-1"></div>
        {props.admin === true && (
          <>
            <div className="col">
              <button
                onClick={() => props.insertBadge()}
                className="btn btn-success home-form-btn"
              >
                Aggiungi
              </button>
            </div>
            <div className="w-100 mt-1"></div>
            <div className="col">
              <button
                onClick={() => props.updateBadge()}
                className="btn btn-success home-form-btn"
              >
                Aggiorna
              </button>
            </div>
            <div className="w-100 mt-1"></div>
            <div className="col">
              <button
                onClick={() => props.deleteBadge()}
                className="btn btn-success home-form-btn"
              >
                Elimina
              </button>
            </div>
            <div className="w-100 mt-1"></div>
            <div className="col">
              <button
                onClick={() => htmlTableToExcel("badge-table")}
                className="btn btn-success home-form-btn"
              >
                Excel
              </button>
            </div>
            <div className="w-100 mt-1"></div>
            <div className="col">
              <BadgePopup
                content={props.archivioList}
                trigger={<button className="btn btn-success home-form-btn">Resoconto</button>}
                onOpen={props.findArchivio}
                position="right bottom"
              />
            </div>
            <div className="w-100 mt-1"></div>
          </>
        )}
        <div className="col">
          <button onClick={openPopup} className="btn btn-success home-form-btn">
            Provvisori
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormButtons;

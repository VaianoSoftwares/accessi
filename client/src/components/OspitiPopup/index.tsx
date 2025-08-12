import { useEffect, useRef } from "react";
import Popup from "reactjs-popup";
import "./index.css";
import { FormRef, TEventInput } from "../../types";
import { TDOCS } from "../../types/badges";
import { InsertArchBadgeForm } from "../../types/forms";
import toast from "react-hot-toast";
import { Postazione } from "../../types/postazioni";
import mergeDocs from "../../utils/mergePdfFiles";
import { useQuery } from "@tanstack/react-query";
import NominativiDataService from "../../services/nominativo";
import useError from "../../hooks/useError";

function isCodiceFiscale(cf: string) {
  return (
    cf.length === 16 &&
    /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}$/.test(
      cf.toUpperCase()
    )
  );
}

export default function OspitiPopup(props: {
  isShown: boolean;
  closePopup: () => void;
  insertOsp: (data: FormData) => void;
  currPostazione: Postazione | undefined;
  scannedValue: string;
  clearScannedValue: () => void;
}) {
  const formRef = useRef<FormRef<InsertArchBadgeForm>>({
    badge_cod: null,
    nome: null,
    cognome: null,
    ditta: null,
    cod_fisc: null,
    telefono: null,
    ndoc: null,
    tdoc: null,
    assegnazione: null,
    targa: null,
    docs: null,
  });

  const { handleError } = useError();

  const assegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: async () => {
      try {
        const response = await NominativiDataService.getAssegnazioni();
        console.log("queryAssegnazioni | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  async function createFormData() {
    const formData = new FormData();
    formData.append("post_id", String(props.currPostazione!.id));
    await Promise.all(
      Object.entries(formRef.current)
        .filter(([_, el]) => el !== null && el.value)
        .map(async ([key, el]) => {
          switch (key) {
            case "docs":
              const filesToMerge = (el as HTMLInputElement).files;
              if (!filesToMerge) return;
              const blobToUpload = await mergeDocs(filesToMerge);
              if (!blobToUpload) return;
              formData.append(key, blobToUpload, "docs.pdf");
              break;
            default:
              formData.append(key, el!.value);
          }
        })
    );
    return formData;
  }

  async function insertOspBtnEvent() {
    if (props.currPostazione) {
      const formData = await createFormData();
      props.insertOsp(formData);
      props.clearScannedValue();
      props.closePopup();
    } else {
      toast.error("Nessuna postazione selezionata");
    }
  }

  function onChangeNDocOsp(e: TEventInput) {
    const { value } = e.target;
    if (!isCodiceFiscale(value)) return;

    formRef.current.nome &&
      (formRef.current.nome.value = value.substring(3, 6).toUpperCase());
    formRef.current.cognome &&
      (formRef.current.cognome.value = value.substring(0, 3).toUpperCase());
    formRef.current.tdoc && (formRef.current.tdoc.value = "CARTA IDENTITA");
  }

  useEffect(() => {
    if (props.scannedValue && formRef.current.badge_cod)
      formRef.current.badge_cod.value = props.scannedValue;
  }, [props.scannedValue]);

  return (
    <Popup
      open={props.isShown}
      closeOnDocumentClick
      onClose={props.closePopup}
      modal
    >
      <div className="modal-osp">
        <button className="close" onClick={props.closePopup}>
          &times;
        </button>
        <div className="header">Accessi Provvisori</div>
        <div className="content">
          <div className="submit-form osp-form">
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-codice"
                  placeholder="codice"
                  ref={(el) => (formRef.current.badge_cod = el)}
                  required
                />
                <label htmlFor="osp-codice">codice</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-nome"
                  placeholder="nome"
                  ref={(el) => (formRef.current.nome = el)}
                />
                <label htmlFor="osp-nome">nome</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-cognome"
                  placeholder="cognome"
                  ref={(el) => (formRef.current.cognome = el)}
                />
                <label htmlFor="osp-cognome">cognome</label>
              </div>
            </div>
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-ditta"
                  placeholder="ditta"
                  ref={(el) => (formRef.current.ditta = el)}
                />
                <label htmlFor="osp-ditta">ditta</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-ndoc"
                  placeholder="num documento"
                  ref={(el) => (formRef.current.ndoc = el)}
                  onChange={onChangeNDocOsp}
                  required
                />
                <label htmlFor="osp-ndoc">num documento</label>
              </div>
              <div className="form-floating col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="osp-tdoc"
                  ref={(el) => (formRef.current.tdoc = el)}
                  defaultValue={"CARTA IDENTITA"}
                  required
                >
                  {TDOCS.map((tipoDoc) => (
                    <option value={tipoDoc} key={tipoDoc}>
                      {tipoDoc}
                    </option>
                  ))}
                </select>
                <label htmlFor="osp-tdoc">tipo documento</label>
              </div>
            </div>
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-telefono"
                  placeholder="telefono"
                  ref={(el) => (formRef.current.telefono = el)}
                />
                <label htmlFor="osp-telefono">telefono</label>
              </div>
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cod_fisc"
                  autoComplete="off"
                  ref={(el) => (formRef.current.cod_fisc = el)}
                />
                <label htmlFor="cod_fisc">codice fiscale</label>
              </div>
              <div className="form-floating col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="osp-assegnazione"
                  ref={(el) => (formRef.current.assegnazione = el)}
                >
                  <option key="-1" />
                  {assegnazioni.isSuccess &&
                    assegnazioni.data.map((assegnazione) => (
                      <option value={assegnazione} key={assegnazione}>
                        {assegnazione}
                      </option>
                    ))}
                </select>
                <label htmlFor="osp-assegnazione">assegnazione</label>
              </div>
            </div>
            <div className="row">
              <div className="form-floating col-sm-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="osp-targa"
                  autoComplete="off"
                  ref={(el) => (formRef.current.targa = el)}
                />
                <label htmlFor="osp-targa">targa</label>
              </div>
              <div className="col-sm-4 input-group custom-input-file one-third-col">
                <label htmlFor="docs" className="input-group-text">
                  documenti
                </label>
                <input
                  accept=".pdf"
                  type="file"
                  multiple
                  className="form-control form-control-sm"
                  id="docs"
                  autoComplete="off"
                  ref={(el) => (formRef.current.docs = el)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={insertOspBtnEvent}>
            Invio
          </button>
        </div>
      </div>
    </Popup>
  );
}

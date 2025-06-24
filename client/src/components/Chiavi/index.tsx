import ArchivioDataService from "../../services/archivio";
import "./index.css";
import { useContext, useRef } from "react";
import BadgeTable from "../BadgeTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Clock from "../Clock";
import { FindInPrestitoData } from "../../types/archivio";
import { CurrPostazioneContext, CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";
import { TPermessi, hasPerm } from "../../types/users";
import htmlTableToExcel from "../../utils/htmlTableToExcel";
import { FormRef, GenericForm } from "../../types";
import { InsertArchChiaveForm } from "../../types/forms";
import { TDOCS } from "../../types/badges";
import mergeDocs from "../../utils/mergePdfFiles";
import printPrestitoReport from "../../utils/printPrestitoReport";

const TABLE_NAME = "in_prestito_table";

export default function Chiavi(props: {
  scanValues: string[];
  addScanValue: (value: string) => void;
  removeScanValue: (value: string) => void;
  clearScanValues: () => void;
}) {
  const barcodeTxtInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<FormRef<InsertArchChiaveForm>>({
    nome: null,
    cognome: null,
    ditta: null,
    cod_fisc: null,
    telefono: null,
    ndoc: null,
    tdoc: null,
    docs: null,
  });

  const queryClient = useQueryClient();
  const { handleError } = useError();

  const { currentUser } = useContext(CurrentUserContext)!;
  const { currPostazione } = useContext(CurrPostazioneContext)!;

  const queryInPrestito = useQuery({
    queryKey: [
      "inPrestito",
      {
        postazioniIds: currPostazione
          ? [currPostazione.id]
          : currentUser?.postazioni_ids,
      },
    ],
    queryFn: async (context) => {
      try {
        const response = await ArchivioDataService.getInPrestito(
          context.queryKey[1] as FindInPrestitoData
        );
        console.log("retriveInPrestito | response:", response);
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

  const mutateInPrestito = useMutation({
    mutationFn: (data: FormData) => ArchivioDataService.prestaChiavi(data),
    onSuccess: async (response) => {
      console.log("prestaChiavi | response", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      printPrestitoReport(response.data.result.in.rows);

      await queryClient.invalidateQueries({ queryKey: ["inPrestito"] });
      props.clearScanValues();
      setForm();
      toast.success("Chiave/i prestate/rese con successo");
    },
    onError: async (err) => handleError(err, "prestaChiavi"),
  });

  async function createFormData() {
    const formData = new FormData();
    props.scanValues.forEach((value) => formData.append("barcodes", value));
    formData.append("post_id", String(currPostazione?.id));
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

  function setForm(obj: GenericForm = {}) {
    Object.entries(formRef.current)
      .filter(([key, el]) => el !== null && key in formRef.current)
      .forEach(([key, el]) => {
        const mappedKey = key as keyof InsertArchChiaveForm;
        if (el instanceof HTMLInputElement)
          el.value = obj[mappedKey] || el.defaultValue;
        else if (el instanceof HTMLSelectElement && el.options.length > 0)
          el.value = obj[mappedKey] || el.options.item(0)!.value;
      });
  }

  return (
    <div id="chiavi-wrapper">
      <div className="container-fluid m-1 chiavi-container">
        <div className="row mt-2 justify-content-start align-items-start submit-form">
          <div className="col-7 chiavi-form">
            <div className="row my-1">
              <div className="col-4">
                <div className="input-group custom-add-barcode-input">
                  <div className="input-group-text">
                    <button
                      onClick={() => {
                        const barcode = barcodeTxtInput?.current?.value;
                        barcode && props.addScanValue(barcode);
                        barcodeTxtInput.current &&
                          (barcodeTxtInput.current.value =
                            barcodeTxtInput.current.defaultValue);
                      }}
                    >
                      Aggiungi
                    </button>
                  </div>
                  <input
                    className="form-control form-control-sm"
                    ref={barcodeTxtInput}
                    type="text"
                    placeholder="Inserire qui barcode"
                  />
                </div>
                <div className="barcode-list col-sm my-1">
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
              </div>
              <div className="col">
                <div className="row">
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="nome"
                      placeholder="nome"
                      autoComplete="off"
                      ref={(el) => (formRef.current.nome = el)}
                    />
                    <label htmlFor="cognome">nome</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="cognome"
                      placeholder="cognome"
                      autoComplete="off"
                      ref={(el) => (formRef.current.cognome = el)}
                    />
                    <label htmlFor="cognome">cognome</label>
                  </div>
                  <div className="w-100"></div>
                  <div className="form-floating col-sm-6">
                    <select
                      className="form-select form-select-sm"
                      id="tdoc"
                      ref={(el) => (formRef.current.tdoc = el)}
                    >
                      <option key="-1" />
                      {TDOCS.filter((tipoDoc) => tipoDoc).map((tipoDoc) => (
                        <option value={tipoDoc} key={tipoDoc}>
                          {tipoDoc}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="tdoc">tipo documento</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="ndoc"
                      placeholder="num documento"
                      autoComplete="off"
                      ref={(el) => (formRef.current.ndoc = el)}
                    />
                    <label htmlFor="ndoc">num documento</label>
                  </div>
                  <div className="w-100"></div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="cod_fisc"
                      placeholder="cod_fisc"
                      autoComplete="off"
                      ref={(el) => (formRef.current.cod_fisc = el)}
                    />
                    <label htmlFor="telefono">codice fiscale</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="osp-ditta"
                      placeholder="ditta"
                      ref={(el) => (formRef.current.ditta = el)}
                    />
                    <label htmlFor="osp-ditta">ditta</label>
                  </div>
                  <div className="w-100"></div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="telefono"
                      placeholder="telefono"
                      autoComplete="off"
                      ref={(el) => (formRef.current.telefono = el)}
                    />
                    <label htmlFor="telefono">telefono</label>
                  </div>
                  <div className="w-100"></div>
                  <div className="col-sm-6 input-group custom-input-file">
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
          </div>
          <div className="col-sm-1">
            <div className="form-buttons">
              <div className="row align-items-center justify-content-start g-0">
                <div className="col">
                  <button
                    className="btn btn-success chiavi-form-btn"
                    onClick={async () => {
                      if (!currPostazione) {
                        toast.error("Campo Postazione mancante");
                        return;
                      }

                      const formData = await createFormData();
                      mutateInPrestito.mutate(formData);
                    }}
                  >
                    Invio
                  </button>
                </div>
                <div className="w-100 mt-1" />
                {hasPerm(currentUser, TPermessi.canAccessInStruttReport) && (
                  <div className="col">
                    <button
                      onClick={() =>
                        htmlTableToExcel(TABLE_NAME, "chiavi-in-prestito")
                      }
                      className="btn btn-success chiavi-form-btn"
                    >
                      Esporta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-4">
            <Clock></Clock>
          </div>
        </div>
      </div>
      <div className="chiavi-table-wrapper mt-3">
        {queryInPrestito.isSuccess && (
          <BadgeTable
            content={queryInPrestito.data}
            timestampParams={["data_in", "data_out"]}
            tableId={TABLE_NAME}
          />
        )}
      </div>
    </div>
  );
}

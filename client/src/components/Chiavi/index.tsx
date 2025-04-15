import ArchivioDataService from "../../services/archivio";
import "./index.css";
import { useContext, useRef } from "react";
import BadgeTable from "../BadgeTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Clock from "../Clock";
import { FindInPrestitoData, PrestitoChiaviData } from "../../types/archivio";
import { CurrPostazioneContext, CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";
import { TPermessi, hasPerm } from "../../types/users";
import htmlTableToExcel from "../../utils/htmlTableToExcel";

const TABLE_NAME = "in_prestito_table";

export default function Chiavi(props: {
  scanValues: string[];
  addScanValue: (value: string) => void;
  removeScanValue: (value: string) => void;
  clearScanValues: () => void;
}) {
  const barcodeTxtInput = useRef<HTMLInputElement>(null);

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
    mutationFn: (data: PrestitoChiaviData) =>
      ArchivioDataService.prestaChiavi(data),
    onSuccess: async (response) => {
      console.log("prestaChiavi | response", response);
      await queryClient.invalidateQueries({ queryKey: ["inPrestito"] });
      props.clearScanValues();
      toast.success("Chiave/i prestate/rese con successo");
    },
    onError: async (err) => handleError(err, "prestaChiavi"),
  });

  return (
    <div id="chiavi-wrapper">
      <div className="container-fluid m-1 chiavi-container">
        <div className="row mt-2">
          <div className="col-4 chiavi-form">
            <div className="row my-1">
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
          </div>
          <div className="col-sm-1">
            <div className="form-buttons">
              <div className="row align-items-center justify-content-start g-0">
                <div className="col">
                  <button
                    className="btn btn-success chiavi-form-btn"
                    onClick={() => {
                      if (!currPostazione) {
                        toast.error("Campo Postazione mancante");
                        return;
                      }

                      mutateInPrestito.mutate({
                        barcodes: props.scanValues,
                        post_id: currPostazione.id,
                      });
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
          <div className="col-3"></div>
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

import {
  TInPrestito,
  TInPrestitoDataReq,
  TPostazione,
  TPrestitoDataReq,
  TLoggedUser,
} from "../../types";
import BadgeDataService from "../../services/badge";
import "./index.css";
import { useRef } from "react";
import BadgeTable from "../BadgeTable";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TableContentMapper } from "../../utils/tableContentMapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Clock from "../Clock";

export default function Chiavi({
  currPostazione,
  ...props
}: {
  user: TLoggedUser;
  scanValues: string[];
  addScanValue: (value: string) => void;
  removeScanValue: (value: string) => void;
  clearScanValues: () => void;
  currPostazione: TPostazione | undefined;
}) {
  const barcodeTxtInput = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const queryInPrestito = useQuery({
    queryKey: [
      "inPrestito",
      {
        postazione: currPostazione?.name,
      },
    ],
    queryFn: (context) =>
      BadgeDataService.getInPrestito(
        context.queryKey[1] as TInPrestitoDataReq
      ).then((response) => {
        console.log("retriveInPrestito | response:", response);
        const result = response.data.data as TInPrestito[];
        TableContentMapper.parseDate(result);
        return result;
      }),
  });

  const mutateInPrestito = useMutation({
    mutationFn: (data: TPrestitoDataReq) => BadgeDataService.prestaChiavi(data),
    onSuccess: async (response) => {
      console.log("prestaChiavi | response", response);
      await queryClient.invalidateQueries({ queryKey: ["inPrestito"] });
      props.clearScanValues();
    },
    onError: async (err) => axiosErrHandl(err, "prestaChiavi"),
  });

  return (
    <div id="chiavi-wrapper">
      <div className="container-fluid m-1 chiavi-container">
        <div className="row mt-2">
          <div className="col-4 chiavi-form">
            <div className="row">
              <div className="col-sm-3 my-1">
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
              <div className="col-sm-7 my-1">
                <input
                  className="form-control form-control-sm"
                  ref={barcodeTxtInput}
                  type="text"
                  placeholder="barcode"
                />
              </div>
              <div className="w100 mt-1" />
              <div className="barcode-list col-sm-10 my-1">
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
          <div className="col-1">
            <button
              className="btn btn-success"
              onClick={() => {
                if (!currPostazione) {
                  toast.error("Campo Postazione mancante");
                  return;
                }

                mutateInPrestito.mutate({
                  barcodes: props.scanValues,
                  postazioneId: currPostazione._id,
                });
              }}
            >
              Invio
            </button>
          </div>
          <div className="col-3"></div>
          <div className="col-4">
            <Clock></Clock>
          </div>
        </div>
      </div>
      <div className="chiavi-table-wrapper mt-3">
        {queryInPrestito.isSuccess && (
          <BadgeTable content={queryInPrestito.data} />
        )}
      </div>
    </div>
  );
}

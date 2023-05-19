import {
  TInPrestito,
  TInPrestitoDataReq,
  TPostazione,
  TPrestitoDataReq,
  TUser,
} from "../../types";
import BadgeDataService from "../../services/badge";
import "./index.css";
import { useRef } from "react";
import BadgeTable from "../BadgeTable";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TableContentMapper } from "../../utils/tableContentMapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function Chiavi(props: {
  user: TUser;
  scannerConnected: boolean;
  runScanner: () => Promise<void>;
  scanValues: string[];
  addScanValue: (value: string) => void;
  removeScanValue: (value: string) => void;
  clearScanValues: () => void;
}) {
  const barcodeTxtInput = useRef<HTMLInputElement>(null);
  const postazioneRef = useRef<HTMLSelectElement>(null);

  function getCurrPostazioneData() {
    return postazioneRef.current?.options.item(
      postazioneRef.current.selectedIndex
    )?.dataset;
  }

  function getQueryInPrestitoReq() {
    return {
      cliente: props.user.admin ? undefined : getCurrPostazioneData()?.cliente,
      postazione: props.user.admin ? undefined : getCurrPostazioneData()?.name,
    };
  }

  const queryClient = useQueryClient();

  const postazioni = useQuery({
    queryKey: ["postazioni", props.user.postazioni],
    queryFn: (context) =>
      BadgeDataService.getPostazioni({
        ids: context.queryKey[1]
          ? (context.queryKey[1] as string[])
          : undefined,
      }).then((response) => {
        console.log("queryPostazioni | response:", response);
        const result = response.data.data as TPostazione[];
        return result;
      }),
  });

  const queryInPrestito = useQuery({
    queryKey: ["inPrestito", getQueryInPrestitoReq()],
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
          {postazioni.isSuccess && (
            <div className="form-floating col-sm-2">
              <select
                className="form-select form-select-sm"
                id="postazione"
                placeholder="postazione"
                ref={postazioneRef}
                defaultValue={postazioni.data[0].name}
              >
                {postazioni.data
                  .filter(({ cliente, name }) => cliente && name)
                  .map(({ _id, cliente, name }) => (
                    <option
                      data-cliente={cliente}
                      data-name={name}
                      data-id={_id}
                      value={name}
                      key={_id}
                    >
                      {cliente} - {name}
                    </option>
                  ))}
              </select>
              <label htmlFor="postazione">postazione</label>
            </div>
          )}
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
              onClick={() =>
                mutateInPrestito.mutate({
                  barcodes: props.scanValues,
                  cliente: getCurrPostazioneData()!.cliente!,
                  postazione: postazioneRef.current!.value,
                })
              }
            >
              Invio
            </button>
          </div>
          <div className="col-5" />
        </div>
      </div>
      {queryInPrestito.isSuccess && (
        <BadgeTable content={queryInPrestito.data} />
      )}
    </div>
  );
}

import { useRef } from "react";
import {
  ProtocolloFile,
  ProtocolloFindReq,
  TPostazione,
  TUser,
} from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BadgeDataService from "../../services/badge";
import ProtocolloDataService from "../../services/protocollo";
import toast from "react-hot-toast";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import "./index.css";

const ON_PROD_MODE = process.env.NODE_ENV === "production";

export default function Protocollo({
  user,
  currPostazione,
}: {
  user: TUser;
  currPostazione: TPostazione | undefined;
}) {
  const filenameRef = useRef<HTMLInputElement>(null);
  const descrizioneRef = useRef<HTMLInputElement>(null);
  const dataInizioRef = useRef<HTMLInputElement>(null);
  const dataFineRef = useRef<HTMLInputElement>(null);
  const fileDataRef = useRef<HTMLInputElement>(null);
  const visibileDaRef = useRef<HTMLSelectElement>(null);

  const queryClient = useQueryClient();

  function formToObj(): ProtocolloFindReq {
    return {
      filename: filenameRef.current?.value,
      descrizione: descrizioneRef.current?.value,
      dataInzio: dataInizioRef.current?.value,
      dataFine: dataFineRef.current?.value,
      visibileDa:
        visibileDaRef.current?.selectedOptions &&
        Array.from(
          visibileDaRef.current.selectedOptions,
          (option) => option.value
        ),
    } satisfies ProtocolloFindReq;
  }

  function createFormData() {
    const formData = new FormData();

    filenameRef.current?.value &&
      formData.append("filename", filenameRef.current.value);
    descrizioneRef.current?.value &&
      formData.append("descrizione", descrizioneRef.current.value);
    fileDataRef.current?.files?.item(0) &&
      formData.append("fileData", fileDataRef.current.files.item(0)!);
    visibileDaRef.current?.selectedOptions.length &&
      Array.from(
        visibileDaRef.current.selectedOptions,
        (option) => option.value
      ).forEach((option) => formData.append("visibileDa", option));

    return formData;
  }

  const postazioni = useQuery({
    queryKey: ["postazioni", user.postazioni],
    queryFn: (context) =>
      BadgeDataService.getPostazioni({
        _id: context.queryKey[1]
          ? (context.queryKey[1] as string[])
          : undefined,
      }).then((response) => {
        console.log("queryPostazioni | response:", response);
        const result = response.data.data as TPostazione[];
        return result;
      }),
  });

  const queryProtocollo = useQuery({
    queryKey: ["protocollo", currPostazione?._id],
    queryFn: (context) =>
      ProtocolloDataService.find({
        visibileDa: context.queryKey[1]
          ? ([context.queryKey[1]] as string[])
          : undefined,
      }).then((response) => {
        console.log("queryProtocollo | response:", response);
        const result = response.data.data as ProtocolloFile[];
        return result;
      }),
  });

  const findProtocollo = useQuery({
    queryKey: ["protocollo", formToObj()],
    queryFn: (context) =>
      ProtocolloDataService.find(context.queryKey[1] as ProtocolloFindReq).then(
        (response) => {
          console.log("queryProtocollo | response:", response);
          const result = response.data.data as ProtocolloFile[];
          return result;
        }
      ),
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertProtocollo = useMutation({
    mutationFn: (data: FormData) => ProtocolloDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertProtocolloFile | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["protocollo"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "insertProtocolloFile"),
  });

  const deleteProtocollo = useMutation({
    mutationFn: (data: { id: string; filename: string }) =>
      ProtocolloDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteProtocolloFile | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["protocollo"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "deleteProtocolloFile"),
  });

  return (
    <div className="container-fluid m-1">
      <div className="row">
        <div className="col protocollo-form">
          <div className="row mb-2">
            <div className="form-floating col-sm-3">
              <input
                className="form-control form-control-sm"
                type="text"
                id="filename"
                ref={filenameRef}
                defaultValue=""
                autoComplete="off"
                placeholder="Nome File"
              />
              <label htmlFor="filename">Nome File</label>
            </div>
            <div className="form-floating col-sm-3">
              <input
                className="form-control form-control-sm"
                type="text"
                id="descrizione"
                ref={descrizioneRef}
                defaultValue=""
                autoComplete="off"
                placeholder="Descrizione"
              />
              <label htmlFor="descrizione">Descrizione</label>
            </div>
          </div>
          <div className="row mb-2">
            <div className="form-group form-group-sm col-sm-3">
              <input
                type="file"
                className="custom-file-input"
                id="fileData"
                autoComplete="off"
                ref={fileDataRef}
                defaultValue=""
              />
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="visibileDa">Visibile Da</label>
              <select
                className="form-select form-select-sm"
                id="visibileDa"
                ref={visibileDaRef}
                placeholder="Visibile Da"
                multiple
              >
                {postazioni.data
                  ?.filter(({ cliente, name }) => cliente && name)
                  .map(({ _id, cliente, name }) => (
                    <option key={_id} value={_id}>
                      {cliente}-{name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="row mb-2">
            <div className="form-floating col-sm-3">
              <input
                className="form-control form-control-sm"
                type="date"
                id="dataInizio"
                ref={dataInizioRef}
                defaultValue=""
                autoComplete="off"
                placeholder="Data Inizio"
              />
              <label htmlFor="dataInizio">Data Inizio</label>
            </div>
            <div className="form-floating col-sm-3">
              <input
                className="form-control form-control-sm"
                type="date"
                id="dataFine"
                ref={dataFineRef}
                defaultValue=""
                autoComplete="off"
                placeholder="Data Fine"
              />
              <label htmlFor="dataFine">Data Fine</label>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-sm-1">
              <button
                className="btn btn-success"
                onClick={() => findProtocollo.refetch()}
              >
                Cerca
              </button>
            </div>
            <div className="col-sm-1">
              <button
                className="btn btn-success"
                onClick={() => insertProtocollo.mutate(createFormData())}
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
        <div className="col-3 protocollo-file-list border">
          <ul className="list-group list-group-flush">
            {queryProtocollo.isSuccess
              ? queryProtocollo.data.map(({ filename, _id }) => (
                  <li className="list-group-item" key={_id}>
                    {user.admin === true && (
                      <button
                        data-filename={filename}
                        data-id={_id}
                        type="button"
                        className="close btn-del-file"
                        aria-label="Close"
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement, MouseEvent>
                        ) => {
                          const id =
                            event.currentTarget.getAttribute("data-id");
                          const filename =
                            event.currentTarget.getAttribute("data-filename");
                          id &&
                            filename &&
                            deleteProtocollo.mutate({ id, filename });
                        }}
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    )}{" "}
                    <a
                      className="file-list-link"
                      href={
                        ON_PROD_MODE
                          ? `/api/v1/public/protocollo/${filename}`
                          : `${process.env.REACT_APP_PROXY}/api/v1/public/protocollo/${filename}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {filename}
                    </a>
                  </li>
                ))
              : "Nessun File Trovato"}
          </ul>
        </div>
        <div className="col-1"></div>
      </div>
    </div>
  );
}

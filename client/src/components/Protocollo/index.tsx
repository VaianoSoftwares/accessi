import { useRef } from "react";
import { FormRef, ProtocolloFile, ProtocolloFindReq } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PostazioniDataService from "../../services/postazioni";
import ProtocolloDataService from "../../services/protocollo";
import toast from "react-hot-toast";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import "./index.css";
import Clock from "../Clock";
import { Postazione } from "../../types/badges";
import { TLoggedUser, isAdmin } from "../../types/users";
import { ProtocolloForm } from "../../types/forms";

const ON_PROD_MODE = process.env.NODE_ENV === "production";

export default function Protocollo({
  user,
  currPostazione,
}: {
  user: TLoggedUser;
  currPostazione: Postazione | undefined;
}) {
  const formRef = useRef<FormRef<ProtocolloForm>>({
    filename: null,
    descrizione: null,
    data_in: null,
    data_out: null,
    fileData: null,
    visibileDa: null,
  });

  const queryClient = useQueryClient();

  function formToObj() {
    const obj: Record<PropertyKey, any> = {};
    Object.entries(formRef.current)
      .filter(([key, el]) => el?.value && key !== "fileData")
      .forEach(([key, el]) => {
        switch (key) {
          case "visibileDa":
            obj[key] = Array.from(
              (el as HTMLSelectElement).selectedOptions,
              (option) => option.value
            );
            break;
          default:
            obj[key] = el!.value;
        }
      });
    return obj;
  }

  function createFormData() {
    const formData = new FormData();

    Object.entries(formRef.current)
      .filter(([, el]) => el !== null)
      .forEach(([key, el]) => {
        switch (key) {
          case "visibileDa":
            Array.from(
              (el as HTMLSelectElement).selectedOptions,
              (option) => option.value
            ).forEach((option) => formData.append(key, option));
            break;
          case "fileData":
            el = el as HTMLInputElement;
            el.files &&
              Array.from(el.files).forEach((file) =>
                formData.append(key, file)
              );
            break;
          case "descrizione":
            formData.append(key, el!.value);
        }
      });

    return formData;
  }

  const postazioni = useQuery({
    queryKey: ["postazioni", user.postazioni],
    queryFn: (context) =>
      PostazioniDataService.get({
        ids: context.queryKey[1] as number[],
      }).then((response) => {
        console.log("queryPostazioni | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        const result = response.data.result;
        return result;
      }),
  });

  const queryProtocollo = useQuery({
    queryKey: ["protocollo", currPostazione?.id],
    queryFn: (context) =>
      ProtocolloDataService.find({
        visibileDa: context.queryKey[1]
          ? ([context.queryKey[1]] as string[])
          : undefined,
      }).then((response) => {
        console.log("queryProtocollo | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }
        const result = response.data.result as ProtocolloFile[];
        return result;
      }),
  });

  const findProtocollo = useQuery({
    queryKey: ["protocollo", formToObj()],
    queryFn: (context) =>
      ProtocolloDataService.find(context.queryKey[1] as ProtocolloFindReq).then(
        (response) => {
          console.log("queryProtocollo | response:", response);
          if (response.data.success === false) {
            throw response.data.error;
          }
          const result = response.data.result as ProtocolloFile[];
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
      toast.success("Protocollo inserito con successo");
    },
    onError: async (err) => axiosErrHandl(err, "insertProtocolloFile"),
  });

  const deleteProtocollo = useMutation({
    mutationFn: (id: number) => ProtocolloDataService.delete(id),
    onSuccess: async (response) => {
      console.log("deleteProtocolloFile | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["protocollo"] });
      toast.success("Protocollo eliminato con successo");
    },
    onError: async (err) => axiosErrHandl(err, "deleteProtocolloFile"),
  });

  return (
    <div className="container-fluid m-1">
      <div className="row">
        <div className="col-5 protocollo-form">
          <div className="row mb-2">
            <div className="form-floating col-sm-6">
              <input
                className="form-control form-control-sm"
                type="text"
                id="filename"
                ref={(el) => (formRef.current.filename = el)}
                autoComplete="off"
                placeholder="Nome File"
              />
              <label htmlFor="filename">Nome File</label>
            </div>
            <div className="form-floating col-sm-6">
              <input
                className="form-control form-control-sm"
                type="text"
                id="descrizione"
                ref={(el) => (formRef.current.descrizione = el)}
                autoComplete="off"
                placeholder="Descrizione"
              />
              <label htmlFor="descrizione">Descrizione</label>
            </div>
            <div className="w-100 my-1"></div>
            <div className="form-group form-group-sm col-sm-6">
              <input
                type="file"
                className="custom-file-input"
                id="fileData"
                autoComplete="off"
                ref={(el) => (formRef.current.fileData = el)}
                multiple
              />
            </div>
            <div className="form-group col-sm-6">
              <label htmlFor="visibileDa">Visibile Da</label>
              <select
                className="form-select form-select-sm"
                id="visibileDa"
                ref={(el) => (formRef.current.visibileDa = el)}
                placeholder="Visibile Da"
                multiple
              >
                {postazioni.isSuccess &&
                  postazioni.data
                    .filter(({ cliente, name }) => cliente && name)
                    .map(({ id, cliente, name }) => (
                      <option key={id} value={id}>
                        {cliente}-{name}
                      </option>
                    ))}
              </select>
            </div>
            <div className="w-100 my-1"></div>
            <div className="form-floating col-sm-6">
              <input
                className="form-control form-control-sm"
                type="date"
                id="dataInizio"
                ref={(el) => (formRef.current.data_in = el)}
                autoComplete="off"
                placeholder="Data Inizio"
              />
              <label htmlFor="dataInizio">Data Inizio</label>
            </div>
            <div className="form-floating col-sm-6">
              <input
                className="form-control form-control-sm"
                type="date"
                id="dataFine"
                ref={(el) => (formRef.current.data_out = el)}
                autoComplete="off"
                placeholder="Data Fine"
              />
              <label htmlFor="dataFine">Data Fine</label>
            </div>
          </div>
        </div>
        <div className="col-2">
          <div className="row align-items-center justify-content-start g-0">
            <div className="col">
              <button
                className="btn btn-success"
                onClick={() => findProtocollo.refetch()}
              >
                Cerca
              </button>
            </div>
            <div className="w-100 my-1"></div>
            <div className="col">
              <button
                className="btn btn-success"
                onClick={() => insertProtocollo.mutate(createFormData())}
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
        <div className="col">
          <Clock></Clock>
        </div>
      </div>
      <div className="row my-1">
        <div className="col-3 protocollo-file-list border">
          <ul className="list-group list-group-flush">
            {queryProtocollo.isSuccess
              ? queryProtocollo.data.map(({ filename, _id }) => (
                  <li className="list-group-item" key={_id}>
                    {isAdmin(user) === true && (
                      <button
                        data-filename={filename}
                        data-id={_id}
                        type="button"
                        className="close btn-del-file"
                        aria-label="Close"
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement, MouseEvent>
                        ) => {
                          const id = Number.parseInt(
                            event.currentTarget.getAttribute("data-id") || ""
                          );
                          if (Number.isNaN(id)) return;
                          deleteProtocollo.mutate(id);
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
      </div>
    </div>
  );
}

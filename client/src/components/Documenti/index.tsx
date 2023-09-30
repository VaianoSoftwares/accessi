import DocumentsDataService from "../../services/docs";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import BadgeTable from "../BadgeTable";
import "./index.css";
import useImage from "../../hooks/useImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { TDocFormState, TDocumento } from "../../types";
import { toast } from "react-hot-toast";
import Clock from "../Clock";

export default function Documenti(props: { admin: boolean }) {
  const codiceRef = useRef<HTMLInputElement>(null);
  const aziendaRef = useRef<HTMLInputElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const cognomeRef = useRef<HTMLInputElement>(null);
  const docimgRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const findDocumenti = useQuery({
    queryKey: ["documenti", formToObj()],
    queryFn: () =>
      DocumentsDataService.find(formToObj()).then((response) => {
        console.log("findDocumenti | response: ", response);

        const result = response.data.data as TDocumento[];

        if (result.length === 1) {
          const { filename } = result[0];
          updateImage(filename);

          setForm(result[0]);
        }

        return result;
      }),
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertDocumento = useMutation({
    mutationFn: (data: FormData) => DocumentsDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertDocumento | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["documenti"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "insertDocumento"),
    onSettled: async () => refreshPage(),
  });

  const updateDocumento = useMutation({
    mutationFn: (data: FormData) => DocumentsDataService.update(data),
    onSuccess: async (response) => {
      console.log("updateDocumento | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["documenti"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "updateDocumento"),
    onSettled: async () => refreshPage(),
  });

  const deleteDocumento = useMutation({
    mutationFn: (data: string) => DocumentsDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteDocumento | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["documenti"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "deleteDocumento"),
    onSettled: async () => refreshPage(),
  });

  const [docImgUrl, { updateImage, setNoImage }] = useImage((filename) =>
    filename ? `/api/v1/public/documenti/${filename}` : ""
  );

  function clearForm() {
    codiceRef.current!.value = codiceRef.current!.defaultValue;
    aziendaRef.current!.value = aziendaRef.current!.defaultValue;
    nomeRef.current!.value = nomeRef.current!.defaultValue;
    cognomeRef.current!.value = cognomeRef.current!.defaultValue;
    docimgRef.current!.files = null;
  }

  function createFormData() {
    const data = new FormData();
    data.append("codice", codiceRef.current!.value);
    data.append("azienda", aziendaRef.current!.value);
    data.append("nome", nomeRef.current!.value);
    data.append("cognome", cognomeRef.current!.value);
    const doc = docimgRef.current?.files?.item(0);
    doc && data.append("docimg", doc);
    return data;
  }

  function setForm(obj: TDocumento) {
    codiceRef.current!.value = obj.codice;
    aziendaRef.current!.value = obj.azienda;
    nomeRef.current!.value = obj.nome;
    cognomeRef.current!.value = obj.cognome;
    docimgRef.current!.files = null;
    docimgRef.current!.value = docimgRef.current!.defaultValue;
  }

  function formToObj(): TDocFormState {
    return {
      codice: codiceRef.current?.value || undefined,
      azienda: aziendaRef.current?.value || undefined,
      nome: nomeRef.current?.value || undefined,
      cognome: nomeRef.current?.value || undefined,
    };
  }

  function refreshPage() {
    clearForm();
    setNoImage();
    queryClient.cancelQueries({ queryKey: ["documenti"] });
  }

  return (
    <div id="doc-wrapper">
      <div className="container-fluid m-1">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col-5 doc-form">
            <div className="row m-1">
              <div className="col-4">
                <div className="row">
                  <div
                    className="col doc-img-container"
                    style={{ backgroundImage: `url(${docImgUrl})` }}
                  />
                  <div className="w-100 mb-1" />
                  <div className="col">
                    <div className="input-group input-group-sm">
                      <input
                        accept="image/*"
                        type="file"
                        className="custom-file-input"
                        id="docimg"
                        onChange={(e) => {
                          const file = e.target.files?.item(0);
                          if (file) updateImage(file);
                          else setNoImage();
                        }}
                        disabled={props.admin === false}
                        autoComplete="off"
                        ref={docimgRef}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-8 p-0">
                <div className="row mb-1">
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="codice"
                      placeholder="numero documento"
                      autoComplete="off"
                      ref={codiceRef}
                      defaultValue=""
                    />
                    <label htmlFor="codice">ndoc</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="azienda"
                      placeholder="azienda"
                      autoComplete="off"
                      ref={aziendaRef}
                      defaultValue=""
                    />
                    <label htmlFor="azienda">azienda</label>
                  </div>
                  <div className="w-100 mb-1" />
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="nome"
                      placeholder="nome"
                      autoComplete="off"
                      ref={nomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="nome">nome</label>
                  </div>
                  <div className="form-floating col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="cognome"
                      placeholder="cognome"
                      autoComplete="off"
                      ref={cognomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="cognome">cognome</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-1">
            <div className="col">
              <button
                className="btn btn-success home-form-btn"
                onClick={() => findDocumenti.refetch()}
              >
                Cerca
              </button>
            </div>
            <div className="w-100 mb-1" />
            <div className="col">
              <button
                className="btn btn-success home-form-btn"
                onClick={() => insertDocumento.mutate(createFormData())}
                disabled={props.admin === false}
              >
                Aggiungi
              </button>
            </div>
            <div className="w-100 mb-1" />
            <div className="col">
              <button
                className="btn btn-success home-form-btn"
                onClick={() => {
                  const confirmed = window.confirm(
                    "Procedere alla modifica del documento?"
                  );
                  if (!confirmed) return;
                  updateDocumento.mutate(createFormData());
                }}
                disabled={props.admin === false}
              >
                Modifica
              </button>
            </div>
            <div className="w-100 mb-1" />
            <div className="col p-0">
              <button
                className="btn btn-success home-form-btn"
                onClick={() => {
                  const confirmed = window.confirm(
                    "Procedere alla rimozione del documento?"
                  );
                  if (!confirmed) return;
                  deleteDocumento.mutate(codiceRef.current!.value);
                }}
                disabled={props.admin === false}
              >
                Elimina
              </button>
            </div>
            <div className="w-100 mb-1" />
            <div className="col">
              <button
                className="btn btn-success home-form-btn"
                onClick={refreshPage}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="col-2"></div>
          <div className="col-4">
            <Clock></Clock>
          </div>
        </div>
      </div>
      <div className="doc-table-wrapper">
        {findDocumenti.isSuccess && <BadgeTable content={findDocumenti.data} />}
      </div>
    </div>
  );
}

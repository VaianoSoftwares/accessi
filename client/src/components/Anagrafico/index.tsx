import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useRef, useState } from "react";
import NominativiDataService from "../../services/nominativo";
import ClientiDataService from "../../services/clienti";
import ProvvisoriDataService from "../../services/provvisorio";
import VeicoliDataService from "../../services/veicoli";
import ChiaviDataService from "../../services/chiavi";
import toast from "react-hot-toast";
import useImage from "../../hooks/useImage";
import { BaseForm, AnagraficoForm } from "../../types/forms";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import {
  BadgeDeleteReq,
  STATI_BADGE,
  TDOCS,
  BadgeType,
} from "../../types/badges";
import { FormRef, GenericForm } from "../../types";
import "./index.css";
import { CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";
import { Link } from "react-router-dom";

const PROXY = import.meta.env.DEV ? import.meta.env.VITE_PROXY : "";
const UPLOADS_DIR = "/api/v1/public/uploads/";
const TABLE_ID = "anagrafico-table";

export default function Anagrafico({
  currCliente,
  ...props
}: {
  currCliente: string | undefined;
}) {
  const { currentUser } = useContext(CurrentUserContext)!;
  const { handleError } = useError();

  const formRef = useRef<FormRef<AnagraficoForm>>({
    codice: null,
    descrizione: null,
    stato: null,
    cliente: null,
    nome: null,
    cognome: null,
    assegnazione: null,
    ditta: null,
    cod_fisc: null,
    tdoc: null,
    ndoc: null,
    telefono: null,
    scadenza: null,
    pfp: null,
    privacy: null,
    documento: null,
    ubicazione: null,
    indirizzo: null,
    citta: null,
    edificio: null,
    piano: null,
    proprietario: null,
    targa: null,
    tipo: null,
    zuc_cod: null,
  });

  const queryClient = useQueryClient();

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: async () => {
      try {
        const response = await ClientiDataService.getAll();
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryClienti | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const assegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: async () => {
      try {
        const response = await NominativiDataService.getAssegnazioni();
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryAssegnazioni | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const edifici = useQuery({
    queryKey: ["edifici"],
    queryFn: async () => {
      try {
        const response = await ChiaviDataService.getEdifici();
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryEdifici | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const tVeicoli = useQuery({
    queryKey: ["tveicoli"],
    queryFn: async () => {
      try {
        const response = await VeicoliDataService.getTVeicoli();
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryTVeicoli | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const queryNominativi = useQuery({
    queryKey: ["nominativi"],
    queryFn: async () => {
      try {
        const response = await NominativiDataService.find(
          currCliente ? { cliente: currCliente } : {}
        );
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryNominativi | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const findNominativi = useQuery({
    queryKey: ["nominativi"],
    queryFn: async () => {
      try {
        console.log("currCliente", currCliente);
        console.log("clienti[0]", currentUser?.clienti[0]);
        const response = await NominativiDataService.find(formToObj());
        console.log("findNominativi | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          setForm(result[0]);
          updateImage(result[0].codice);
        }

        return result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertNominativo = useMutation({
    mutationFn: (data: FormData) => NominativiDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertNominativo | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { insertedRow } = response.data.result;
      updateImage(insertedRow.codice);
      setForm(insertedRow);

      await queryClient.invalidateQueries({ queryKey: ["nominativi"] });
      queryNominativi.remove();

      toast.success("Badge inserito con successo");
    },
    onError: async (err) => handleError(err, "insertNominativo"),
  });

  const updateNominativo = useMutation({
    mutationFn: (data: FormData) => NominativiDataService.update(data),
    onSuccess: async (response) => {
      console.log("updateNominativo | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { updatedRow } = response.data.result;
      updateImage(updatedRow.codice);
      setForm(updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["nominativi"] });
      queryNominativi.remove();

      toast.success("Badge modificato con successo");
    },
    onError: async (err) => handleError(err, "updateNominativo"),
  });

  const deleteNominativo = useMutation({
    mutationFn: (data: BadgeDeleteReq) => NominativiDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteNominativo | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["nominativi"] });
      queryNominativi.remove();

      setNoImage();
      clearForm();

      toast.success("Badge rimosso con successo");
    },
    onError: async (err) => handleError(err, "deletePerson"),
  });

  const findProvvisori = useQuery({
    queryKey: ["provvisori"],
    queryFn: async () => {
      try {
        const response = await ProvvisoriDataService.find(formToObj());
        console.log("findProvvisori | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          setForm(result[0]);
        }

        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertProvvisorio = useMutation({
    mutationFn: (data: FormData) => ProvvisoriDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertProvvisorio | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { insertedRow } = response.data.result;
      setForm(insertedRow);

      await queryClient.invalidateQueries({ queryKey: ["provvisori"] });
      findProvvisori.remove();

      toast.success("Badge inserito con successo");
    },
    onError: async (err) => handleError(err, "insertProvvisorio"),
  });

  const updateProvvisorio = useMutation({
    mutationFn: (data: FormData) => ProvvisoriDataService.update(data),
    onSuccess: async (response) => {
      console.log("updateProvvisorio | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { updatedRow } = response.data.result;
      setForm(updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["provvisori"] });
      findProvvisori.remove();

      toast.success("Badge modificato con successo");
    },
    onError: async (err) => handleError(err, "updateProvvisorio"),
  });

  const deleteProvvisorio = useMutation({
    mutationFn: (data: BadgeDeleteReq) => ProvvisoriDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteProvvisorio | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["provvisori"] });
      findProvvisori.remove();

      clearForm();

      toast.success("Badge rimosso con successo");
    },
    onError: async (err) => handleError(err, "deleteProvvisorio"),
  });

  const findChiavi = useQuery({
    queryKey: ["chiavi"],
    queryFn: async () => {
      try {
        const response = await ChiaviDataService.find(formToObj());
        console.log("findChiavi | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          setForm(result[0]);
        }

        return result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertChiave = useMutation({
    mutationFn: (data: FormData) => ChiaviDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertChiave | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { insertedRow } = response.data.result;
      setForm(insertedRow);

      await queryClient.invalidateQueries({ queryKey: ["chiavi"] });
      findChiavi.remove();

      toast.success("Chiave inserita con successo");
    },
    onError: async (err) => handleError(err, "insertChiave"),
  });

  const updateChiave = useMutation({
    mutationFn: (data: FormData) => ChiaviDataService.update(data),
    onSuccess: async (response) => {
      console.log("updateChiave | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { updatedRow } = response.data.result;
      setForm(updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["chiavi"] });
      findChiavi.remove();

      toast.success("Chiave modificata con successo");
    },
    onError: async (err) => handleError(err, "updateChiave"),
  });

  const deleteChiave = useMutation({
    mutationFn: (data: BadgeDeleteReq) => ProvvisoriDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteChiave | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["chiavi"] });
      findChiavi.remove();

      clearForm();

      toast.success("Chiave rimossa con successo");
    },
    onError: async (err) => handleError(err, "deleteChiave"),
  });

  const findVeicoli = useQuery({
    queryKey: ["veicoli"],
    queryFn: async () => {
      try {
        const response = await VeicoliDataService.find(formToObj());
        console.log("findVeicoli | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          setForm(result[0]);
        }

        return result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertVeicolo = useMutation({
    mutationFn: (data: FormData) => VeicoliDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertVeicolo | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { insertedRow } = response.data.result;
      setForm(insertedRow);

      await queryClient.invalidateQueries({ queryKey: ["veicoli"] });
      findVeicoli.remove();

      toast.success("Veicolo inserito con successo");
    },
    onError: async (err) => handleError(err, "insertVeicolo"),
  });

  const updateVeicolo = useMutation({
    mutationFn: (data: FormData) => VeicoliDataService.update(data),
    onSuccess: async (response) => {
      console.log("updateVeicolo | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { updatedRow } = response.data.result;
      setForm(updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["veicoli"] });
      findVeicoli.remove();

      toast.success("Veicolo modificato con successo");
    },
    onError: async (err) => handleError(err, "updateVeicolo"),
  });

  const deleteVeicolo = useMutation({
    mutationFn: (data: BadgeDeleteReq) => VeicoliDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteVeicolo | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["veicoli"] });
      findVeicoli.remove();

      clearForm();

      toast.success("Veicolo rimosso con successo");
    },
    onError: async (err) => handleError(err, "deleteVeicolo"),
  });

  function createFormData() {
    const formData = new FormData();
    Object.entries(formRef.current)
      .filter(([, el]) => el?.value)
      .forEach(([key, el]) => {
        const inputType = el?.getAttribute("type");
        switch (inputType) {
          case "file":
            const fileToUpl = (el as HTMLInputElement).files?.item(0);
            fileToUpl && formData.append(key, fileToUpl);
            break;
          case "checkbox":
            const { checked } = el as HTMLInputElement;
            checked && formData.append(key, el!.value);
          default:
            formData.append(key, el!.value);
        }
      });

    if (currCliente) {
      formData.delete("cliente");
      formData.append("cliente", currCliente);
    }

    return formData;
  }

  function formToObj() {
    const obj: BaseForm = {};
    Object.entries(formRef.current)
      .filter(
        ([, el]) =>
          el?.value &&
          !["file", "checkbox"].includes(el?.getAttribute("type") || "")
      )
      .forEach(([key, el]) => (obj[key] = el!.value));

    if (currCliente) obj["cliente"] = currCliente;

    return obj as Record<string, string>;
  }

  function setForm(obj: GenericForm = {}) {
    Object.entries(formRef.current)
      .filter(([, el]) => el !== null)
      .forEach(([key, el]) => {
        if (el instanceof HTMLSelectElement && el.options.length > 0)
          el.value = obj[key] || el.options.item(0)?.value;
        else if (el instanceof HTMLInputElement) {
          const inputType = el.getAttribute("type");
          switch (inputType) {
            case "date":
              el.value = obj[key]
                ? dateFormat(obj[key], "yyyy-mm-dd")
                : el.defaultValue;
              break;
            case "checkbox":
              el.checked = false;
              break;
            case "file":
              el.value = "";
              break;
            default:
              el.value = obj[key] || el.defaultValue;
          }
        }
      });
  }

  function clearForm() {
    setForm();
  }

  const [currentFormType, setCurrentFormType] = useState<BadgeType>(
    BadgeType.NOMINATIVO
  );

  const [pfpUrl, { updateImage, setNoImage }] = useImage((data) =>
    data ? `${PROXY}${UPLOADS_DIR}PFP_${data}.jpg` : ""
  );

  function getCurrentForm(formType: BadgeType) {
    switch (formType) {
      case BadgeType.NOMINATIVO:
        return (
          <>
            <div className="col-3 mx-1 mt-1 pfp-col">
              <div
                className="pfp-container"
                style={{
                  backgroundImage: `url(${pfpUrl})`,
                }}
              />
              <div className="col-sm input-group custom-input-file">
                <label htmlFor="pfp" className="input-group-text">
                  pfp
                </label>
                <input
                  accept="image/*"
                  type="file"
                  className="form-control form-control-sm"
                  id="pfp"
                  autoComplete="off"
                  ref={(el) => (formRef.current.pfp = el)}
                  onChange={(e) => {
                    const file = e.target.files?.item(0);
                    if (file) updateImage(file);
                    else setNoImage();
                  }}
                />
              </div>
            </div>
            <div className="col mt-1">
              <div className="row">
                <div className="form-floating col-sm-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="nome"
                    placeholder="nome"
                    autoComplete="off"
                    ref={(el) => (formRef.current.nome = el)}
                  />
                  <label htmlFor="nome">nome</label>
                </div>
                <div className="form-floating col-sm-4">
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
                <div className="form-floating col-sm-4">
                  <select
                    className="form-select form-select-sm"
                    id="assegnazione"
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
                  <label htmlFor="assegnazione">assegnazione</label>
                </div>
                <div className="w-100" />
                <div className="form-floating col-sm-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="ditta"
                    placeholder="ditta"
                    autoComplete="off"
                    ref={(el) => (formRef.current.ditta = el)}
                  />
                  <label htmlFor="ditta">ditta</label>
                </div>
                <div className="form-floating col-sm-4">
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
                <div className="form-floating col-sm-4">
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
                <div className="w-100" />
                <div className="form-floating col-sm-4">
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
                <div className="form-floating col-sm-4">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    id="scadenza"
                    autoComplete="off"
                    ref={(el) => (formRef.current.scadenza = el)}
                  />
                  <label htmlFor="scadenza">scadenza</label>
                </div>
                <div className="form-floating col-sm-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="zuc_cod"
                    autoComplete="off"
                    ref={(el) => (formRef.current.zuc_cod = el)}
                  />
                  <label htmlFor="zuc_doc">cod zucchetti</label>
                </div>
                <div className="w-100" />
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
                <div className="col-sm-4 input-group custom-input-file one-third-col">
                  <label htmlFor="privacy" className="input-group-text">
                    privacy
                  </label>
                  <input
                    accept=".pdf"
                    type="file"
                    className="form-control form-control-sm"
                    id="privacy"
                    autoComplete="off"
                    ref={(el) => (formRef.current.privacy = el)}
                  />
                </div>
                <div className="col-sm-4 input-group custom-input-file one-third-col">
                  <label htmlFor="documento" className="input-group-text">
                    documento
                  </label>
                  <input
                    accept=".pdf"
                    type="file"
                    className="form-control form-control-sm"
                    id="documento"
                    autoComplete="off"
                    ref={(el) => (formRef.current.documento = el)}
                  />
                </div>
              </div>
            </div>
          </>
        );
      case BadgeType.PROVVISORIO:
        return (
          <>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="ubicazione"
                placeholder="ubicazione"
                autoComplete="off"
                ref={(el) => (formRef.current.ubicazione = el)}
              />
              <label htmlFor="ubicazione">ubicazione</label>
            </div>
          </>
        );
      case BadgeType.CHIAVE:
        return (
          <>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="indirizzo"
                placeholder="indirizzo"
                autoComplete="off"
                ref={(el) => (formRef.current.indirizzo = el)}
              />
              <label htmlFor="indirizzo">indirizzo</label>
            </div>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="citta"
                placeholder="città"
                autoComplete="off"
                ref={(el) => (formRef.current.citta = el)}
              />
              <label htmlFor="citta">città</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="edificio"
                ref={(el) => (formRef.current.edificio = el)}
              >
                <option key="-1" />
                {edifici.isSuccess &&
                  edifici.data.map((edificio) => (
                    <option value={edificio} key={edificio}>
                      {edificio}
                    </option>
                  ))}
              </select>
              <label htmlFor="edificio">edificio</label>
            </div>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="piano"
                placeholder="piano"
                autoComplete="off"
                ref={(el) => (formRef.current.piano = el)}
              />
              <label htmlFor="piano">piano</label>
            </div>
            <div className="w-100" />
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="ubicazione"
                placeholder="ubicazione"
                autoComplete="off"
                ref={(el) => (formRef.current.ubicazione = el)}
              />
              <label htmlFor="ubicazione">ubicazione</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="proprietario"
                ref={(el) => (formRef.current.proprietario = el)}
              >
                <option key="-1" />
                {queryNominativi.isSuccess &&
                  queryNominativi.data.map(({ codice, nome, cognome }) => (
                    <option value={codice} key={codice}>
                      {`${codice} - ${nome} ${cognome}`}
                    </option>
                  ))}
              </select>
              <label htmlFor="proprietario">proprietario</label>
            </div>
          </>
        );
      case BadgeType.VEICOLO:
        return (
          <>
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="targa"
                placeholder="targa"
                autoComplete="off"
                ref={(el) => (formRef.current.targa = el)}
              />
              <label htmlFor="targa">targa</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="tveicolo"
                ref={(el) => (formRef.current.tipo = el)}
              >
                <option key="-1" />
                {tVeicoli.isSuccess &&
                  tVeicoli.data.map((tveicolo) => (
                    <option value={tveicolo} key={tveicolo}>
                      {tveicolo}
                    </option>
                  ))}
              </select>
              <label htmlFor="tveicolo">tipo veicolo</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="proprietario"
                ref={(el) => (formRef.current.proprietario = el)}
              >
                <option key="-1" />
                {queryNominativi.isSuccess &&
                  queryNominativi.data.map(({ codice, nome, cognome }) => (
                    <option value={codice} key={codice}>
                      {`${codice} - ${nome} ${cognome}`}
                    </option>
                  ))}
              </select>
              <label htmlFor="proprietario">proprietario</label>
            </div>
          </>
        );
      default:
        return <></>;
    }
  }

  function getContentTable() {
    const contentTable = (content: any[]) => (
      <BadgeTable
        content={content}
        tableId={TABLE_ID}
        keyAttribute="codice"
        dateParams={["scadenza"]}
        linkParams={["privacy", "documento"]}
        linkParser={(value: string) => (
          <Link
            to={`${PROXY}${UPLOADS_DIR}${value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </Link>
        )}
        clickRowEvent={async (e) => {
          const codice = e.target.parentElement?.dataset["key"];
          if (!codice) return;
          setForm({ codice });
          switch (currentFormType) {
            case BadgeType.NOMINATIVO:
              return await findNominativi.refetch();
            case BadgeType.PROVVISORIO:
              return await findProvvisori.refetch();
            case BadgeType.CHIAVE:
              return await findChiavi.refetch();
            case BadgeType.VEICOLO:
              return await findVeicoli.refetch();
          }
        }}
      />
    );

    switch (currentFormType) {
      case BadgeType.NOMINATIVO:
        return findNominativi.isSuccess ? (
          contentTable(findNominativi.data)
        ) : (
          <></>
        );
      case BadgeType.PROVVISORIO:
        return findProvvisori.isSuccess ? (
          contentTable(findProvvisori.data)
        ) : (
          <></>
        );
      case BadgeType.CHIAVE:
        return findChiavi.isSuccess ? contentTable(findChiavi.data) : <></>;
      case BadgeType.VEICOLO:
        return findVeicoli.isSuccess ? contentTable(findVeicoli.data) : <></>;
      default:
        return <></>;
    }
  }

  return (
    <div>
      <div className="container-fluid m-1 anagrafico-container">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col anagrafico-form">
            <div className="row my-1">
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="codice"
                  placeholder="codice"
                  autoComplete="off"
                  ref={(el) => (formRef.current.codice = el)}
                />
                <label htmlFor="codice">codice</label>
              </div>
              <div className="form-floating col-sm-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="descrizione"
                  placeholder="descrizione"
                  autoComplete="off"
                  ref={(el) => (formRef.current.descrizione = el)}
                />
                <label htmlFor="descrizione">descrizione</label>
              </div>
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="stato"
                  ref={(el) => (formRef.current.stato = el)}
                >
                  <option key="-1" />
                  {STATI_BADGE.map((stato) => (
                    <option value={stato} key={stato}>
                      {stato}
                    </option>
                  ))}
                </select>
                <label htmlFor="stato">stato</label>
              </div>
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="cliente"
                  ref={(el) => (formRef.current.cliente = el)}
                >
                  <option key="-1" />
                  {clienti.isSuccess &&
                    clienti.data
                      .filter((cliente) =>
                        currentUser?.clienti.includes(cliente)
                      )
                      .map((cliente) => (
                        <option value={cliente} key={cliente}>
                          {cliente}
                        </option>
                      ))}
                </select>
                <label htmlFor="cliente">cliente</label>
              </div>
              <div className="w-100" />
              {getCurrentForm(currentFormType)}
            </div>
            <div className="row justify-content-start gx-0">
              <div className="col-sm-1">
                <button
                  onClick={() => {
                    switch (currentFormType) {
                      case BadgeType.NOMINATIVO:
                        return findNominativi.refetch();
                      case BadgeType.PROVVISORIO:
                        return findProvvisori.refetch();
                      case BadgeType.CHIAVE:
                        return findChiavi.refetch();
                      case BadgeType.VEICOLO:
                        return findVeicoli.refetch();
                    }
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Cerca
                </button>
              </div>
              <div className="col-sm-1">
                <button
                  onClick={() => {
                    switch (currentFormType) {
                      case BadgeType.NOMINATIVO:
                        return insertNominativo.mutate(createFormData());
                      case BadgeType.PROVVISORIO:
                        return insertProvvisorio.mutate(createFormData());
                      case BadgeType.CHIAVE:
                        return insertChiave.mutate(createFormData());
                      case BadgeType.VEICOLO:
                        return insertVeicolo.mutate(createFormData());
                    }
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Aggiungi
                </button>
              </div>
              <div className="col-sm-1">
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Procedere alla modifica del badge?"
                    );
                    if (!confirmed) return;

                    switch (currentFormType) {
                      case BadgeType.NOMINATIVO:
                        return updateNominativo.mutate(createFormData());
                      case BadgeType.PROVVISORIO:
                        return updateProvvisorio.mutate(createFormData());
                      case BadgeType.CHIAVE:
                        return updateChiave.mutate(createFormData());
                      case BadgeType.VEICOLO:
                        return updateVeicolo.mutate(createFormData());
                    }
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Aggiorna
                </button>
              </div>
              <div className="col-sm-1">
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Procedere alla rimozione del badge?"
                    );
                    if (!confirmed) return;

                    const codice = formRef.current.codice?.value;
                    if (!codice) {
                      toast.error("Campo Codice risulta mancante");
                      return;
                    }

                    switch (currentFormType) {
                      case BadgeType.NOMINATIVO:
                        return deleteNominativo.mutate({ codice });
                      case BadgeType.PROVVISORIO:
                        return deleteProvvisorio.mutate({ codice });
                      case BadgeType.CHIAVE:
                        return deleteChiave.mutate({ codice });
                      case BadgeType.VEICOLO:
                        return deleteVeicolo.mutate({ codice });
                    }
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Elimina
                </button>
              </div>
              <div className="col-sm-1">
                <button
                  onClick={async () => {
                    clearForm();
                    setNoImage();

                    queryNominativi.remove();
                    await queryClient.invalidateQueries({
                      queryKey: ["nominativi"],
                    });
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="col-sm-1 form-buttons">
            <div className="row align-items-center justify-content-start g-0">
              <div className="col">
                <button
                  onClick={() => setCurrentFormType(BadgeType.NOMINATIVO)}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Nominativi
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => setCurrentFormType(BadgeType.PROVVISORIO)}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Provvisori
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => setCurrentFormType(BadgeType.CHIAVE)}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Chiavi
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => setCurrentFormType(BadgeType.VEICOLO)}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Veicoli
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="anagrafico-table-wrapper">{getContentTable()}</div>
    </div>
  );
}

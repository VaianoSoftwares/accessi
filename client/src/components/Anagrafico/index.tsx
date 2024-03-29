import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useRef } from "react";
import BadgeDataService from "../../services/badge";
import ClientiDataService from "../../services/clienti";
import toast from "react-hot-toast";
import useImage from "../../hooks/useImage";
import { AnagraficoForm } from "../../types/forms";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import {
  BadgeDeleteReq,
  BadgeFormDataReq,
  STATI_BADGE,
  TDOCS,
  TIPI_BADGE,
} from "../../types/badges";
import { FormRef, GenericForm } from "../../types";
import "./index.css";
import { CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";

const PROXY = import.meta.env.DEV ? import.meta.env.VITE_PROXY : "";

export default function Anagrafico() {
  const { currentUser } = useContext(CurrentUserContext)!;
  const { handleError } = useError();

  const formRef = useRef<FormRef<AnagraficoForm>>({
    codice: null,
    descrizione: null,
    tipo: null,
    assegnazione: null,
    stato: null,
    ubicazione: null,
    cliente: null,
    nome: null,
    cognome: null,
    telefono: null,
    ditta: null,
    tdoc: null,
    ndoc: null,
    scadenza: null,
    pfp: null,
    privacy: null,
    documento: null,
    indirizzo: null,
    citta: null,
    edificio: null,
    piano: null,
    tveicolo: null,
    targa1: null,
    targa2: null,
    targa3: null,
    targa4: null,
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
        const response = await BadgeDataService.getAssegnazioni();
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
        const response = await BadgeDataService.getEdifici();
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
        const response = await BadgeDataService.getTVeicoli();
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

  const findBadges = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      try {
        const response = await BadgeDataService.find(formToObj());
        console.log("findBadges | response:", response);
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

  const insertBadge = useMutation({
    mutationFn: (data: BadgeFormDataReq) => BadgeDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertBadge | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { insertedRow } = response.data.result;
      updateImage(insertedRow.codice);
      setForm(insertedRow);

      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      findBadges.remove();

      toast.success("Badge inserito con successo");
    },
    onError: async (err) => handleError(err, "insertBadge"),
  });

  const updateBadge = useMutation({
    mutationFn: (data: BadgeFormDataReq) => BadgeDataService.update(data),
    onSuccess: async (response) => {
      console.log("insertBadge | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { updatedRow } = response.data.result;
      updateImage(updatedRow.codice);
      setForm(updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      findBadges.remove();

      toast.success("Badge modificato con successo");
    },
    onError: async (err) => handleError(err, "updateBadge"),
  });

  const deleteBadge = useMutation({
    mutationFn: (data: BadgeDeleteReq) => BadgeDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteBadge | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      findBadges.remove();

      setNoImage();
      clearForm();

      toast.success("Badge eliminato con successo");
    },
    onError: async (err) => handleError(err, "deleteBadge"),
  });

  const [pfpUrl, { updateImage, setNoImage }] = useImage((data) =>
    data ? `${PROXY}/api/v1/public/uploads/PFP_${data}.jpg` : ""
  );

  function createFormData() {
    const formData = new FormData();
    Object.entries(formRef.current)
      .filter(([_, el]) => el !== null && el.value)
      .forEach(([key, el]) => {
        switch (key) {
          case "tipo":
            break;
          case "pfp":
          case "privacy":
          case "documento":
            const fileToUpl = (el as HTMLInputElement).files?.item(0);
            fileToUpl && formData.append(key, fileToUpl);
            break;
          default:
            formData.append(key, el!.value);
        }
      });
    return formData;
  }

  function formToObj() {
    const obj: AnagraficoForm = {};
    Object.entries(formRef.current)
      .filter(
        ([, el]) =>
          el !== null && el.value && el.getAttribute("type") !== "file"
      )
      .forEach(([key, el]) => (obj[key as keyof AnagraficoForm] = el!.value));
    return obj;
  }

  function setForm(obj: GenericForm = {}) {
    Object.entries(formRef.current)
      .filter(([key, el]) => el !== null && key in formRef.current)
      .forEach(([key, el]) => {
        const mappedKey = key as keyof AnagraficoForm;
        switch (mappedKey) {
          case "scadenza":
            el instanceof HTMLInputElement &&
              (el.value = obj[mappedKey]
                ? dateFormat(obj[mappedKey], "yyyy-mm-dd")
                : el.defaultValue);
            break;
          default:
            if (el instanceof HTMLInputElement)
              el.value = obj[mappedKey] || el.defaultValue;
            else if (el instanceof HTMLSelectElement && el.options.length > 0)
              el.value = obj[mappedKey] || el.options.item(0)?.value;
        }
      });
  }

  function clearForm() {
    setForm();
  }

  return (
    <div>
      <div className="container-fluid m-1 anagrafico-container">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col anagrafico-form">
            <div className="row my-1">
              <div className="form-floating col-sm-4">
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
              <div className="form-floating col-sm-4">
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
              <div className="form-floating col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="tipo"
                  placeholder="tipo"
                  ref={(el) => (formRef.current.tipo = el)}
                >
                  <option key="-1" />
                  {TIPI_BADGE.map((tipo) => (
                    <option value={tipo} key={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                <label htmlFor="tipo">tipo</label>
              </div>
              <div className="w-100"></div>
              <div className="form-floating col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="stato"
                  placeholder="stato"
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
              <div className="form-floating col-sm-4">
                <select
                  className="form-select form-select-sm"
                  id="cliente"
                  placeholder="cliente"
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
              <div className="form-floating col-sm-4">
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
            </div>
            <hr />
            <div className="row my-1">
              <div className="col-3 mx-3 pfp-col">
                <div
                  className="pfp-container"
                  style={{
                    backgroundImage: `url(${pfpUrl})`,
                  }}
                />
                <div className="col-sm input-group custom-input-file custom-input-pfp">
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
              <div className="col-9">
                <div className="row">
                  <div className="form-floating col-sm">
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
                  <div className="w-100" />
                  <div className="form-floating col-sm-6">
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
                  <div className="w-100" />
                  <div className="form-floating col-sm-6">
                    <select
                      className="form-select form-select-sm"
                      id="tdoc"
                      placeholder="tipo documento"
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
                  <div className="w-100" />
                  <div className="form-floating col-sm-6">
                    <select
                      className="form-select form-select-sm"
                      id="assegnazione"
                      placeholder="assegnazione"
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
                  <div className="form-floating col-sm-6">
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      id="scadenza"
                      autoComplete="off"
                      ref={(el) => (formRef.current.scadenza = el)}
                    />
                    <label htmlFor="scadenza">scadenza</label>
                  </div>
                  <div className="w-100" />
                  <div className="col-sm-6 input-group custom-input-file half-col">
                    <label htmlFor="privacy" className="input-group-text">
                      privacy
                    </label>
                    <input
                      accept="image/*"
                      type="file"
                      className="form-control form-control-sm"
                      id="privacy"
                      autoComplete="off"
                      ref={(el) => (formRef.current.privacy = el)}
                    />
                  </div>
                  <div className="col-sm-6 input-group custom-input-file half-col">
                    <label htmlFor="documento" className="input-group-text">
                      documento
                    </label>
                    <input
                      accept="image/*"
                      type="file"
                      className="form-control form-control-sm"
                      id="documento"
                      autoComplete="off"
                      ref={(el) => (formRef.current.documento = el)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="row my-1">
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
                  placeholder="edificio"
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
            </div>
            <hr />
            <div className="row my-1">
              <div className="form-floating col-sm-3">
                <select
                  className="form-select form-select-sm"
                  id="tveicolo"
                  placeholder="tipo veicolo"
                  ref={(el) => (formRef.current.tveicolo = el)}
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
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="targa1"
                  placeholder="targa1"
                  autoComplete="off"
                  ref={(el) => (formRef.current.targa1 = el)}
                />
                <label htmlFor="targa1">targa1</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="targa2"
                  placeholder="targa2"
                  ref={(el) => (formRef.current.targa2 = el)}
                />
                <label htmlFor="targa2">targa2</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="targa3"
                  placeholder="targa3"
                  autoComplete="off"
                  ref={(el) => (formRef.current.targa3 = el)}
                />
                <label htmlFor="targa3">targa3</label>
              </div>
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="targa4"
                  placeholder="targa4"
                  autoComplete="off"
                  ref={(el) => (formRef.current.targa4 = el)}
                />
                <label htmlFor="targa4">targa4</label>
              </div>
            </div>
          </div>
          <div className="col-sm-1 form-buttons">
            <div className="row align-items-center justify-content-start g-0">
              <div className="col">
                <button
                  onClick={() => findBadges.refetch()}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Cerca
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => {
                    const tipoBadge = formRef.current.tipo?.value.toLowerCase();
                    if (!tipoBadge) {
                      toast.error("Campo Tipo mancante");
                      return;
                    }
                    insertBadge.mutate({
                      data: createFormData(),
                      tipoBadge,
                    });
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Aggiungi
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Procedere alla modifica del badge?"
                    );
                    if (!confirmed) return;

                    const tipoBadge = formRef.current.tipo?.value.toLowerCase();
                    if (!tipoBadge) {
                      toast.error("Campo Tipo mancante");
                      return;
                    }

                    updateBadge.mutate({
                      data: createFormData(),
                      tipoBadge,
                    });
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Aggiorna
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Procedere alla rimozione del badge?"
                    );
                    if (!confirmed) return;

                    const tipoBadge = formRef.current.tipo?.value.toLowerCase();
                    if (!tipoBadge) {
                      toast.error("Campo Tipo mancante");
                      return;
                    }

                    const codice = formRef.current.codice?.value;
                    if (!codice) {
                      toast.error("Campo Codice mancante");
                      return;
                    }

                    deleteBadge.mutate({
                      data: { codice },
                      tipoBadge,
                    });
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Elimina
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => {
                    clearForm();
                    setNoImage();
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="anagrafico-table-wrapper">
        {findBadges.isSuccess && (
          <BadgeTable
            content={findBadges.data}
            tableId="anagrafico-table"
            dateParams={["scadenza"]}
            clickRowEvent={(e) => {
              const codice = e.target.parentElement?.dataset["key"];
              if (!codice) return;
              setForm({ codice });
              findBadges.refetch();
            }}
            keyAttribute="codice"
          />
        )}
      </div>
    </div>
  );
}

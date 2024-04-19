import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useRef, useState } from "react";
import BadgeDataService from "../../services/badge";
import ClientiDataService from "../../services/clienti";
import PeopleDataService from "../../services/people";
import VeicoliDataService from "../../services/veicoli";
import ChiaviDataService from "../../services/chiavi";
import toast from "react-hot-toast";
import useImage from "../../hooks/useImage";
import {
  BadgesForm,
  BaseForm,
  ChiaviForm,
  PeopleForm,
  VeicoliForm,
} from "../../types/forms";
import dateFormat from "dateformat";
import BadgeTable from "../BadgeTable";
import {
  BadgeDeleteReq,
  BadgePrefix,
  ChiaveDeleteReq,
  PersonDeleteReq,
  STATI_BADGE,
  TDOCS,
  VeicoloDeleteReq,
} from "../../types/badges";
import { FormRef, GenericForm, ReactFormRef } from "../../types";
import "./index.css";
import { CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";

enum FormType {
  people,
  badges,
  chiavi,
  veicoli,
}

const PROXY = import.meta.env.DEV ? import.meta.env.VITE_PROXY : "";
const TABLE_ID = "anagrafico-table";

function createFormData(form: ReactFormRef) {
  const formData = new FormData();
  Object.entries(form.current)
    .filter(([_, el]) => el !== null && el.value)
    .forEach(([key, el]) => {
      const inputType = el!.getAttribute("type");
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
  return formData;
}

function formToObj(form: ReactFormRef) {
  const obj: BaseForm = {};
  Object.entries(form.current)
    .filter(
      ([, el]) =>
        el !== null &&
        el.value &&
        !["file", "checkbox"].includes(el?.getAttribute("type") || "")
    )
    .forEach(([key, el]) => (obj[key] = el!.value));
  return obj as Record<string, string>;
}

function objToForm(form: ReactFormRef, obj: GenericForm = {}) {
  Object.entries(form.current)
    .filter(([key, el]) => el !== null && key in form.current)
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
          default:
            el.value = obj[key] || el.defaultValue;
        }
      }
    });
  return form.current;
}

function clearForm(form: ReactFormRef) {
  return objToForm(form);
}

export default function Anagrafico() {
  const { currentUser } = useContext(CurrentUserContext)!;
  const { handleError } = useError();

  const peopleForm = useRef<FormRef<PeopleForm>>({
    id: null,
    nome: null,
    cognome: null,
    assegnazione: null,
    ditta: null,
    tdoc: null,
    ndoc: null,
    telefono: null,
    scadenza: null,
    pfp: null,
    privacy: null,
    documento: null,
    cliente: null,
  });
  const badgeForm = useRef<FormRef<BadgesForm>>({
    codice: null,
    descrizione: null,
    stato: null,
    ubicazione: null,
    cliente: null,
    proprietario: null,
    provvisorio: null,
  });
  const chiaviForm = useRef<FormRef<ChiaviForm>>({
    codice: null,
    descrizione: null,
    stato: null,
    ubicazione: null,
    cliente: null,
    proprietario: null,
    indirizzo: null,
    citta: null,
    edificio: null,
    piano: null,
  });
  const veicoliForm = useRef<FormRef<VeicoliForm>>({
    id: null,
    targa: null,
    tipo: null,
    proprietario: null,
    cliente: null,
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
        const response = await PeopleDataService.getAssegnazioni();
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

  const queryPeople = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      try {
        const response = await PeopleDataService.getAll();
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryPeople | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const findPeople = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      try {
        const response = await PeopleDataService.find(formToObj(peopleForm));
        console.log("findPeople | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          peopleForm.current = objToForm(peopleForm, result[0]);
          updateImage(result[0].id);
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

  const insertPerson = useMutation({
    mutationFn: (data: FormData) => PeopleDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertPerson | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { insertedRow } = response.data.result;
      updateImage(insertedRow.id);
      peopleForm.current = objToForm(peopleForm, insertedRow);

      await queryClient.invalidateQueries({ queryKey: ["people"] });
      queryPeople.remove();

      toast.success("Persona inserita con successo");
    },
    onError: async (err) => handleError(err, "insertPerson"),
  });

  const updatePerson = useMutation({
    mutationFn: (data: FormData) => PeopleDataService.update(data),
    onSuccess: async (response) => {
      console.log("updatePerson | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { updatedRow } = response.data.result;
      updateImage(updatedRow.id);
      peopleForm.current = objToForm(peopleForm, updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["people"] });
      queryPeople.remove();

      toast.success("Persona modificata con successo");
    },
    onError: async (err) => handleError(err, "updatePerson"),
  });

  const deletePerson = useMutation({
    mutationFn: (data: PersonDeleteReq) => PeopleDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deletePerson | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["people"] });
      queryPeople.remove();

      setNoImage();
      clearForm(peopleForm);

      toast.success("Persona rimossa con successo");
    },
    onError: async (err) => handleError(err, "deletePerson"),
  });

  const findBadges = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      try {
        const response = await BadgeDataService.find(formToObj(badgeForm));
        console.log("findBadges | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          badgeForm.current = objToForm(badgeForm, result[0]);
          badgeForm.current.provvisorio &&
            badgeForm.current.provvisorio instanceof HTMLInputElement &&
            (badgeForm.current.provvisorio.checked =
              Number.parseInt(result[0].codice[0]) === BadgePrefix.PROVVISORIO);
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
    mutationFn: (data: FormData) => BadgeDataService.insert(data),
    onSuccess: async (response) => {
      console.log("insertBadge | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { insertedRow } = response.data.result;
      badgeForm.current = objToForm(peopleForm, insertedRow);

      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      findBadges.remove();

      toast.success("Badge inserito con successo");
    },
    onError: async (err) => handleError(err, "insertBadge"),
  });

  const updateBadge = useMutation({
    mutationFn: (data: FormData) => BadgeDataService.update(data),
    onSuccess: async (response) => {
      console.log("updateBadge | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }

      const { updatedRow } = response.data.result;
      badgeForm.current = objToForm(badgeForm, updatedRow);

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

      clearForm(badgeForm);

      toast.success("Badge rimosso con successo");
    },
    onError: async (err) => handleError(err, "deleteBadge"),
  });

  const findChiavi = useQuery({
    queryKey: ["chiavi"],
    queryFn: async () => {
      try {
        const response = await ChiaviDataService.find(formToObj(chiaviForm));
        console.log("findChiavi | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          chiaviForm.current = objToForm(chiaviForm, result[0]);
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
      chiaviForm.current = objToForm(chiaviForm, insertedRow);

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
      chiaviForm.current = objToForm(chiaviForm, updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["chiavi"] });
      findChiavi.remove();

      toast.success("Chiave modificata con successo");
    },
    onError: async (err) => handleError(err, "updateChiave"),
  });

  const deleteChiave = useMutation({
    mutationFn: (data: ChiaveDeleteReq) => BadgeDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteChiave | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["chiavi"] });
      findChiavi.remove();

      clearForm(chiaviForm);

      toast.success("Chiave rimossa con successo");
    },
    onError: async (err) => handleError(err, "deleteChiave"),
  });

  const findVeicoli = useQuery({
    queryKey: ["veicoli"],
    queryFn: async () => {
      try {
        const response = await VeicoliDataService.find(formToObj(veicoliForm));
        console.log("findVeicoli | response:", response);
        if (response.data.success === false) {
          throw response.data.error;
        }

        const { result } = response.data;
        if (result.length === 1) {
          veicoliForm.current = objToForm(veicoliForm, result[0]);
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
      veicoliForm.current = objToForm(veicoliForm, insertedRow);

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
      veicoliForm.current = objToForm(veicoliForm, updatedRow);

      await queryClient.invalidateQueries({ queryKey: ["veicoli"] });
      findVeicoli.remove();

      toast.success("Veicolo modificato con successo");
    },
    onError: async (err) => handleError(err, "updateVeicolo"),
  });

  const deleteVeicolo = useMutation({
    mutationFn: (data: VeicoloDeleteReq) => VeicoliDataService.delete(data),
    onSuccess: async (response) => {
      console.log("deleteVeicolo | response:", response);

      await queryClient.invalidateQueries({ queryKey: ["veicoli"] });
      findVeicoli.remove();

      clearForm(veicoliForm);

      toast.success("Veicolo rimosso con successo");
    },
    onError: async (err) => handleError(err, "deleteVeicolo"),
  });

  const [currentFormType, setCurrentFormType] = useState<FormType>(
    FormType.people
  );

  const [pfpUrl, { updateImage, setNoImage }] = useImage((data) =>
    data ? `${PROXY}/api/v1/public/uploads/PFP_${data}.jpg` : ""
  );

  function getContentTable(formType: FormType) {
    switch (formType) {
      case FormType.people:
        return findPeople.isSuccess ? (
          <BadgeTable
            content={findPeople.data}
            tableId={TABLE_ID}
            dateParams={["scadenza"]}
            clickRowEvent={(e) => {
              const id = e.target.parentElement?.dataset["key"];
              if (!id) return;
              peopleForm.current = objToForm(peopleForm, { id });
              findPeople.refetch();
            }}
            keyAttribute="id"
          />
        ) : (
          <></>
        );
      case FormType.badges:
        return findBadges.isSuccess ? (
          <BadgeTable
            content={findBadges.data}
            tableId={TABLE_ID}
            clickRowEvent={(e) => {
              const codice = e.target.parentElement?.dataset["key"];
              if (!codice) return;
              badgeForm.current = objToForm(badgeForm, { codice });
              findBadges.refetch();
            }}
            keyAttribute="codice"
          />
        ) : (
          <></>
        );
      case FormType.chiavi:
        return findChiavi.isSuccess ? (
          <BadgeTable
            content={findChiavi.data}
            tableId={TABLE_ID}
            clickRowEvent={(e) => {
              const codice = e.target.parentElement?.dataset["key"];
              if (!codice) return;
              chiaviForm.current = objToForm(chiaviForm, { codice });
              findChiavi.refetch();
            }}
            keyAttribute="codice"
          />
        ) : (
          <></>
        );
      case FormType.veicoli:
        return findVeicoli.isSuccess ? (
          <BadgeTable
            content={findVeicoli.data}
            tableId={TABLE_ID}
            clickRowEvent={(e) => {
              const id = e.target.parentElement?.dataset["key"];
              if (!id) return;
              veicoliForm.current = objToForm(veicoliForm, { id });
              findVeicoli.refetch();
            }}
            keyAttribute="id"
          />
        ) : (
          <></>
        );
      default:
        return <></>;
    }
  }

  function getFormBtns(formType: FormType) {
    switch (formType) {
      case FormType.people:
        return (
          <div className="row justify-content-start gx-0">
            <div className="col-sm-1">
              <button
                onClick={() => findPeople.refetch()}
                className="btn btn-success anagrafico-form-btn"
              >
                Cerca
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  insertPerson.mutate(createFormData(peopleForm));
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
                    "Procedere alla modifica della persona?"
                  );
                  if (!confirmed) return;
                  updatePerson.mutate(createFormData(peopleForm));
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

                  const id = Number.parseInt(
                    peopleForm.current.id?.value || ""
                  );

                  deletePerson.mutate({ id });
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Elimina
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  clearForm(peopleForm);
                  setNoImage();
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Refresh
              </button>
            </div>
          </div>
        );
      case FormType.badges:
        return (
          <div className="row justify-content-start gx-0">
            <div className="col-sm-1">
              <button
                onClick={() => findBadges.refetch()}
                className="btn btn-success anagrafico-form-btn"
              >
                Cerca
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  insertBadge.mutate(createFormData(badgeForm));
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
                  const formData = createFormData(badgeForm);
                  formData.delete("provvisorio");
                  updateBadge.mutate(formData);
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

                  const codice = badgeForm.current.codice?.value;
                  if (!codice) {
                    toast.error("Campo Codice risulta mancante");
                    return;
                  }

                  deleteBadge.mutate({ codice });
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Elimina
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  clearForm(badgeForm);
                  setNoImage();
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Refresh
              </button>
            </div>
          </div>
        );
      case FormType.chiavi:
        return (
          <div className="row justify-content-start gx-0">
            <div className="col-sm-1">
              <button
                onClick={() => findChiavi.refetch()}
                className="btn btn-success anagrafico-form-btn"
              >
                Cerca
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  insertChiave.mutate(createFormData(chiaviForm));
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
                    "Procedere alla modifica della chiave?"
                  );
                  if (!confirmed) return;
                  updateChiave.mutate(createFormData(chiaviForm));
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
                    "Procedere alla rimozione della chiave?"
                  );
                  if (!confirmed) return;

                  const codice = chiaviForm.current.codice?.value;
                  if (!codice) {
                    toast.error("Campo Codice risulta mancante");
                    return;
                  }

                  deleteChiave.mutate({ codice });
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Elimina
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  clearForm(chiaviForm);
                  setNoImage();
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Refresh
              </button>
            </div>
          </div>
        );
      case FormType.veicoli:
        return (
          <div className="row justify-content-start gx-0">
            <div className="col-sm-1">
              <button
                onClick={() => findVeicoli.refetch()}
                className="btn btn-success anagrafico-form-btn"
              >
                Cerca
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  insertVeicolo.mutate(createFormData(veicoliForm));
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
                    "Procedere alla modifica del veicolo?"
                  );
                  if (!confirmed) return;
                  updateVeicolo.mutate(createFormData(veicoliForm));
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
                    "Procedere alla rimozione del veicolo?"
                  );
                  if (!confirmed) return;

                  const id = Number.parseInt(
                    veicoliForm.current.id?.value || ""
                  );

                  deleteVeicolo.mutate({ id });
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Elimina
              </button>
            </div>
            <div className="col-sm-1">
              <button
                onClick={() => {
                  clearForm(veicoliForm);
                  setNoImage();
                }}
                className="btn btn-success anagrafico-form-btn"
              >
                Refresh
              </button>
            </div>
          </div>
        );
      default:
        return <></>;
    }
  }

  function getCurrentForm(formType: FormType) {
    switch (formType) {
      case FormType.people:
        return (
          <div className="row my-1">
            <div className="col-3 mx-3 pfp-col">
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
                  ref={(el) => (peopleForm.current.pfp = el)}
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
                <div className="form-floating col-sm-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="nome"
                    placeholder="nome"
                    autoComplete="off"
                    ref={(el) => (peopleForm.current.nome = el)}
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
                    ref={(el) => (peopleForm.current.cognome = el)}
                  />
                  <label htmlFor="cognome">cognome</label>
                </div>
                <div className="form-floating col-sm-4">
                  <select
                    className="form-select form-select-sm"
                    id="assegnazione"
                    placeholder="assegnazione"
                    ref={(el) => (peopleForm.current.assegnazione = el)}
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
                    ref={(el) => (peopleForm.current.ditta = el)}
                  />
                  <label htmlFor="ditta">ditta</label>
                </div>
                <div className="form-floating col-sm-4">
                  <select
                    className="form-select form-select-sm"
                    id="tdoc"
                    placeholder="tipo documento"
                    ref={(el) => (peopleForm.current.tdoc = el)}
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
                    ref={(el) => (peopleForm.current.ndoc = el)}
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
                    ref={(el) => (peopleForm.current.telefono = el)}
                  />
                  <label htmlFor="telefono">telefono</label>
                </div>
                <div className="form-floating col-sm-4">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    id="scadenza"
                    autoComplete="off"
                    ref={(el) => (peopleForm.current.scadenza = el)}
                  />
                  <label htmlFor="scadenza">scadenza</label>
                </div>
                <div className="form-floating col-sm-4">
                  <select
                    className="form-select form-select-sm"
                    id="cliente"
                    placeholder="cliente"
                    ref={(el) => (peopleForm.current.cliente = el)}
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
                <div className="col-sm-4 input-group custom-input-file half-col">
                  <label htmlFor="privacy" className="input-group-text">
                    privacy
                  </label>
                  <input
                    accept="image/*"
                    type="file"
                    className="form-control form-control-sm"
                    id="privacy"
                    autoComplete="off"
                    ref={(el) => (peopleForm.current.privacy = el)}
                  />
                </div>
                <div className="col-sm-4 input-group custom-input-file half-col">
                  <label htmlFor="documento" className="input-group-text">
                    documento
                  </label>
                  <input
                    accept="image/*"
                    type="file"
                    className="form-control form-control-sm"
                    id="documento"
                    autoComplete="off"
                    ref={(el) => (peopleForm.current.documento = el)}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case FormType.badges:
        return (
          <div className="row my-1">
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="codice"
                placeholder="codice"
                autoComplete="off"
                ref={(el) => (badgeForm.current.codice = el)}
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
                ref={(el) => (badgeForm.current.descrizione = el)}
              />
              <label htmlFor="descrizione">descrizione</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="stato"
                placeholder="stato"
                ref={(el) => (badgeForm.current.stato = el)}
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
              <input
                type="text"
                className="form-control form-control-sm"
                id="ubicazione"
                placeholder="ubicazione"
                autoComplete="off"
                ref={(el) => (badgeForm.current.ubicazione = el)}
              />
              <label htmlFor="ubicazione">ubicazione</label>
            </div>
            <div className="w-100" />
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="cliente"
                placeholder="cliente"
                ref={(el) => (badgeForm.current.cliente = el)}
              >
                <option key="-1" />
                {clienti.isSuccess &&
                  clienti.data
                    .filter((cliente) => currentUser?.clienti.includes(cliente))
                    .map((cliente) => (
                      <option value={cliente} key={cliente}>
                        {cliente}
                      </option>
                    ))}
              </select>
              <label htmlFor="cliente">cliente</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="proprietario"
                placeholder="proprietario"
                ref={(el) => (badgeForm.current.proprietario = el)}
              >
                <option key="-1" />
                {queryPeople.isSuccess &&
                  queryPeople.data.map((person) => (
                    <option value={person.id} key={person.id}>
                      {`${person.id} - ${person.nome} ${person.cognome}`}
                    </option>
                  ))}
              </select>
              <label htmlFor="proprietario">proprietario</label>
            </div>
            <div className="form-check col-sm-3 align-self-center mx-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="provvisorio"
                autoComplete="off"
                defaultValue={1}
                ref={(el) => (badgeForm.current.provvisorio = el)}
              />
              <label className="form-check-label" htmlFor="provvisorio">
                provvisorio
              </label>
            </div>
          </div>
        );
      case FormType.chiavi:
        return (
          <div className="row my-1">
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="codice"
                placeholder="codice"
                autoComplete="off"
                ref={(el) => (chiaviForm.current.codice = el)}
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
                ref={(el) => (chiaviForm.current.descrizione = el)}
              />
              <label htmlFor="descrizione">descrizione</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="stato"
                placeholder="stato"
                ref={(el) => (chiaviForm.current.stato = el)}
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
              <input
                type="text"
                className="form-control form-control-sm"
                id="ubicazione"
                placeholder="ubicazione"
                autoComplete="off"
                ref={(el) => (chiaviForm.current.ubicazione = el)}
              />
              <label htmlFor="ubicazione">ubicazione</label>
            </div>
            <div className="w-100" />
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="indirizzo"
                placeholder="indirizzo"
                autoComplete="off"
                ref={(el) => (chiaviForm.current.indirizzo = el)}
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
                ref={(el) => (chiaviForm.current.citta = el)}
              />
              <label htmlFor="citta">città</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="edificio"
                placeholder="edificio"
                ref={(el) => (chiaviForm.current.edificio = el)}
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
                ref={(el) => (chiaviForm.current.piano = el)}
              />
              <label htmlFor="piano">piano</label>
            </div>
            <div className="w-100" />
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="cliente"
                placeholder="cliente"
                ref={(el) => (chiaviForm.current.cliente = el)}
              >
                <option key="-1" />
                {clienti.isSuccess &&
                  clienti.data
                    .filter((cliente) => currentUser?.clienti.includes(cliente))
                    .map((cliente) => (
                      <option value={cliente} key={cliente}>
                        {cliente}
                      </option>
                    ))}
              </select>
              <label htmlFor="cliente">cliente</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="proprietario"
                placeholder="proprietario"
                ref={(el) => (chiaviForm.current.proprietario = el)}
              >
                <option key="-1" />
                {queryPeople.isSuccess &&
                  queryPeople.data.map((person) => (
                    <option value={person.id} key={person.id}>
                      {`${person.id} - ${person.nome} ${person.cognome}`}
                    </option>
                  ))}
              </select>
              <label htmlFor="proprietario">proprietario</label>
            </div>
          </div>
        );
      case FormType.veicoli:
        return (
          <div className="row my-1">
            <div className="form-floating col-sm-3">
              <input
                type="text"
                className="form-control form-control-sm"
                id="targa"
                placeholder="targa"
                autoComplete="off"
                ref={(el) => (veicoliForm.current.targa = el)}
              />
              <label htmlFor="targa">targa</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="tveicolo"
                placeholder="tipo veicolo"
                ref={(el) => (veicoliForm.current.tipo = el)}
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
                id="cliente"
                placeholder="cliente"
                ref={(el) => (veicoliForm.current.cliente = el)}
              >
                <option key="-1" />
                {clienti.isSuccess &&
                  clienti.data
                    .filter((cliente) => currentUser?.clienti.includes(cliente))
                    .map((cliente) => (
                      <option value={cliente} key={cliente}>
                        {cliente}
                      </option>
                    ))}
              </select>
              <label htmlFor="cliente">cliente</label>
            </div>
            <div className="form-floating col-sm-3">
              <select
                className="form-select form-select-sm"
                id="proprietario"
                placeholder="proprietario"
                ref={(el) => (veicoliForm.current.proprietario = el)}
              >
                <option key="-1" />
                {queryPeople.isSuccess &&
                  queryPeople.data.map((person) => (
                    <option value={person.id} key={person.id}>
                      {`${person.id} - ${person.nome} ${person.cognome}`}
                    </option>
                  ))}
              </select>
              <label htmlFor="proprietario">proprietario</label>
            </div>
          </div>
        );
      default:
        return <></>;
    }
  }

  return (
    <div>
      <div className="container-fluid m-1 anagrafico-container">
        <div className="row justify-content-start align-items-start submit-form">
          <div className="col anagrafico-form">
            {getCurrentForm(currentFormType)}
            {getFormBtns(currentFormType)}
          </div>
          <div className="col-sm-1 form-buttons">
            <div className="row align-items-center justify-content-start g-0">
              <div className="col">
                <button
                  onClick={() => setCurrentFormType(FormType.people)}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Persone
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => {
                    setCurrentFormType(FormType.badges);
                  }}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Badge
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => setCurrentFormType(FormType.chiavi)}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Chiavi
                </button>
              </div>
              <div className="col mt-1">
                <button
                  onClick={() => setCurrentFormType(FormType.veicoli)}
                  className="btn btn-success anagrafico-form-btn"
                >
                  Veicoli
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="anagrafico-table-wrapper">
        {getContentTable(currentFormType)}
      </div>
    </div>
  );
}

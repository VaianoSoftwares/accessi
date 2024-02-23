import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import UserDataService from "../../services/user";
import PostazioniDataService from "../../services/postazioni";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { PERMESSI_INFO, UpdateUserData } from "../../types/users";
import { PAGES_INFO } from "../../types/pages";
import { UpdateUserForm } from "../../types/forms";
import { FormRef } from "../../types";

const formRefDefaultState: Record<keyof UpdateUserForm, null> = {
  name: null,
  password: null,
  postazioni: null,
  pages: null,
  permessi: null,
};

function selectPermessiOptions(disabled = false) {
  const options = [];
  for (const [key, value] of PERMESSI_INFO.entries()) {
    options.push(
      <option key={key} value={key} disabled={disabled}>
        {value}
      </option>
    );
  }
  return options;
}

function selectPagesOptions(disabled = false) {
  const options = [];
  for (const [key, { name }] of PAGES_INFO.entries()) {
    options.push(
      <option key={key} value={key} disabled={disabled}>
        {name}
      </option>
    );
  }
  return options;
}

export default function UserEdit() {
  const { userId } = useParams();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const formRef = useRef<FormRef<UpdateUserForm>>(formRefDefaultState);
  const readonlyFormRef = useRef<FormRef<UpdateUserForm>>(formRefDefaultState);

  const postazioni = useQuery({
    queryKey: ["postazioni"],
    queryFn: async () => {
      const response = await PostazioniDataService.getAll();
      console.log("getPostazioni | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      return result;
    },
  });

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const response = await UserDataService.getUser({ id: userId! });
      console.log("userQuery | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      return result;
    },
  });

  const updateUser = useMutation({
    mutationFn: (data: UpdateUserData) =>
      UserDataService.updateUser({ id: userId!, user: data }),
    onSuccess: async (response) => {
      console.log("updateUser | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["users", userId] });
      toast.success("Utente aggiornato con successo");
    },
    onError: async (err) => axiosErrHandl(err, "updateUser"),
  });

  const deleteUser = useMutation({
    mutationFn: () => UserDataService.deleteUser({ id: userId! }),
    onSuccess: async (response) => {
      console.log("deleteUser | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utente eliminato con successo");
      navigate("/admin/users");
    },
    onError: async (err) => axiosErrHandl(err, "deleteUser"),
  });

  function formToObj() {
    const obj: Record<PropertyKey, any> = {};
    Object.entries(formRef.current)
      .filter(([, el]) => el !== null)
      .forEach(([key, el]) => {
        switch (key) {
          case "postazioni":
            if (!(el instanceof HTMLSelectElement)) return;
            obj[key] = Array.from(el.selectedOptions, (option) =>
              Number.parseInt(option.value)
            ).filter((v) => !Number.isNaN(v));
            break;
          case "permessi":
          case "pages":
            if (!(el instanceof HTMLSelectElement)) return;
            obj[key] = Array.from(el.selectedOptions, (option) =>
              Number.parseInt(option.value)
            )
              .filter((v) => !Number.isNaN(v))
              .reduce((acc, curr) => acc | curr, 0);
            break;
          default:
            obj[key] = el!.value;
        }
      });
    return obj as UpdateUserData;
  }

  function selectPostazioniOptions(disabled = false) {
    return postazioni.isSuccess
      ? postazioni.data
          .filter(({ cliente, name }) => cliente && name)
          .map(({ id, cliente, name }) => (
            <option key={id} value={id} disabled={disabled}>
              {cliente}-{name}
            </option>
          ))
      : [];
  }

  return (
    <div className="user-edit-wrapper submit-form container-fluid">
      {userQuery.isSuccess && (
        <>
          <h2>Modifica Account: {userQuery.data.name}</h2>
          <div className="row mb-1">
            <div className="form-group col-sm-3">
              <label htmlFor="username">Username</label>
              <input
                className="form-control form-control-sm"
                type="text"
                id="username"
                ref={(el) => (readonlyFormRef.current.name = el)}
                autoComplete="off"
                readOnly
              />
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="new-username">Nuovo Username</label>
              <input
                className="form-control form-control-sm"
                type="text"
                id="new-username"
                ref={(el) => (formRef.current.name = el)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="row mb-1">
            <div className="form-group col-sm-3">
              <label htmlFor="password">Password</label>
              <input
                className="form-control form-control-sm"
                type="password"
                id="password"
                ref={(el) => (readonlyFormRef.current.password = el)}
                autoComplete="off"
                readOnly
              />
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="new-password">Nuova Password</label>
              <input
                className="form-control form-control-sm"
                type="password"
                id="new-password"
                ref={(el) => (formRef.current.password = el)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="row mb-1">
            <div className="form-group col-sm-3">
              <label htmlFor="permessi">Permessi</label>
              <select
                className="form-control form-control-sm"
                id="permessi"
                ref={(el) => (readonlyFormRef.current.permessi = el)}
                multiple
              >
                {selectPermessiOptions(true)}
              </select>
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="new-permessi">Nuovi Permessi</label>
              <select
                className="form-control form-control-sm"
                id="new-permessi"
                ref={(el) => (formRef.current.permessi = el)}
                multiple
              >
                {selectPermessiOptions()}
              </select>
            </div>
          </div>
          <div className="row mb-1">
            <div className="form-group col-sm-3">
              <label htmlFor="pages">Pagine</label>
              <select
                className="form-control form-control-sm"
                id="pages"
                ref={(el) => (readonlyFormRef.current.pages = el)}
                multiple
              >
                {selectPagesOptions(true)}
              </select>
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="pages">Nuove Pagine</label>
              <select
                className="form-control form-control-sm"
                id="pages"
                ref={(el) => (formRef.current.pages = el)}
                multiple
              >
                {selectPagesOptions()}
              </select>
            </div>
          </div>
          <div className="row mb-1">
            <div className="form-group col-sm-3">
              <label htmlFor="postazioni">Postazioni</label>
              <select
                className="form-control form-control-sm"
                id="postazioni"
                ref={(el) => (readonlyFormRef.current.postazioni = el)}
                multiple
                value={userQuery.data.postazioni.map((p) => String(p))}
              >
                {selectPostazioniOptions(true)}
              </select>
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="new-postazioni">Nuove Postazioni</label>
              <select
                className="form-control form-control-sm"
                id="new-postazioni"
                ref={(el) => (formRef.current.postazioni = el)}
                multiple
              >
                {selectPostazioniOptions()}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-success mx-1"
            onClick={() => {
              const confirm = window.confirm(
                "Procedere alla modifica dell'utente?"
              );
              if (!confirm) return;
              updateUser.mutate(formToObj());
            }}
          >
            Applica Modifiche
          </button>
          <button
            type="submit"
            className="btn btn-danger mx-1"
            onClick={() => {
              const confirm = window.confirm(
                "Procedere all'eliminazione dell'utente?"
              );
              if (!confirm) return;
              deleteUser.mutate();
            }}
          >
            Elimina Utente
          </button>
          <Link to="..">
            <button type="submit" className="btn btn-secondary mx-1">
              Torna Indietro
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

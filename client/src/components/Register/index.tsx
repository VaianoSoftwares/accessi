import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import UserDataService from "../../services/user";
import PostazioniDataService from "../../services/postazioni";
import { toast } from "react-hot-toast";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { FormRef } from "../../types";
import { PAGES_INFO } from "../../types/pages";
import { RegisterForm } from "../../types/forms";
import { InsertUserData, PERMESSI_INFO } from "../../types/users";

function selectPermessiOptions() {
  const options = [];
  for (const [key, value] of PERMESSI_INFO.entries()) {
    options.push(
      <option key={key} value={key}>
        {value}
      </option>
    );
  }
  return options;
}

function selectPagesOptions() {
  const options = [];
  for (const [key, { name }] of PAGES_INFO.entries()) {
    options.push(
      <option key={key} value={key}>
        {name}
      </option>
    );
  }
  return options;
}

export default function Register() {
  const formRef = useRef<FormRef<RegisterForm>>({
    name: null,
    password: null,
    postazioni: null,
    pages: null,
    permessi: null,
  });

  const postazioni = useQuery({
    queryKey: ["postazioni"],
    queryFn: async () => {
      const response = await PostazioniDataService.getAll();
      console.log("queryPostazioni | response:", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      return result;
    },
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
    return obj as InsertUserData;
  }

  function clearForm() {
    Object.entries(formRef.current).forEach(([, el]) => {
      if (el instanceof HTMLInputElement) el.value = el.defaultValue;
      else if (el instanceof HTMLSelectElement) el.selectedIndex = -1;
    });
  }

  function register() {
    UserDataService.register(formToObj())
      .then((response) => {
        console.log("register |", response.data);
        toast.success("Utente registrato con successo");
      })
      .catch((err) => axiosErrHandl(err, "register"))
      .finally(() => clearForm());
  }

  return (
    <div className="submit-form container-fluid">
      <h2>Registra Nuovo Account</h2>
      <div className="row mb-1">
        <div className="form-group col-sm-3">
          <label htmlFor="username">Username</label>
          <input
            className="form-control form-control-sm"
            type="text"
            id="username"
            ref={(el) => (formRef.current.name = el)}
            required
            autoComplete="off"
          />
        </div>
        <div className="form-group col-sm-3">
          <label htmlFor="password">Password</label>
          <input
            className="form-control form-control-sm"
            type="password"
            id="password"
            ref={(el) => (formRef.current.password = el)}
            required
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
            ref={(el) => (formRef.current.permessi = el)}
            multiple
            required
          >
            {selectPermessiOptions()}
          </select>
        </div>
        <div className="form-group col-sm-3">
          <label htmlFor="pages">Pagine</label>
          <select
            className="form-control form-control-sm"
            id="pages"
            ref={(el) => (formRef.current.pages = el)}
            multiple
            required
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
            ref={(el) => (formRef.current.postazioni = el)}
            multiple
            required
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
      </div>
      <button onClick={() => register()} className="btn btn-success">
        Register
      </button>
    </div>
  );
}

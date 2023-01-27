import React from "react";
import UserDataService from "../services/user";
import { RegisterFormState } from "../types/RegisterFormState";
import { TAlert } from "../types/TAlert";
import { TPostazione } from "../types/TPostazione";
import Alert from "./Alert";

type Props = {
  alert: TAlert | null;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
  clienti: string[];
  postazioni: TPostazione[];
};

const Register: React.FC<Props> = (props: Props) => {
  const usernameRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const adminRef = React.useRef<HTMLInputElement>(null);
  const deviceRef = React.useRef<HTMLInputElement>(null);
  const clientiRef = React.useRef<HTMLSelectElement>(null);
  const postazioniRef = React.useRef<HTMLSelectElement>(null);

  function formToObj(): RegisterFormState {
    return {
      username: usernameRef.current!.value,
      password: passwordRef.current!.value,
      admin: adminRef.current!.checked,
      device: deviceRef.current!.checked,
      clienti: Array.from(
        clientiRef.current!.selectedOptions,
        (option) => option.value
      ),
      postazioni: Array.from(
        postazioniRef.current!.selectedOptions,
        (option) => option.value
      ),
    };
  }

  function clearForm() {
    usernameRef.current!.value = usernameRef.current!.defaultValue;
    passwordRef.current!.value = passwordRef.current!.defaultValue;
    adminRef.current!.checked = adminRef.current!.defaultChecked;
    deviceRef.current!.checked = deviceRef.current!.defaultChecked;
    clientiRef.current!.selectedIndex = -1;
    postazioniRef.current!.selectedIndex = -1;
  }

  function register() {
    UserDataService.register(formToObj())
      .then((response) => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.openAlert({ success, msg });
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          const { success, msg } = err.response.data;
          props.openAlert({ success, msg });
        }
      })
      .finally(() => clearForm());
  }

  return (
    <div className="submit-form">
      <h2>Registra Nuovo Account</h2>
      <div className="form-group col-sm-2 mb-2">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          className="form-control form-control-sm"
          id="username"
          required
          autoComplete="off"
          ref={usernameRef}
          defaultValue=""
        />
      </div>
      <div className="form-group col-sm-2 mb-2">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control form-control-sm"
          id="password"
          required
          autoComplete="off"
          ref={passwordRef}
          defaultValue=""
        />
      </div>
      <div className="form-check col-sm-2 mb-2">
        <label htmlFor="admin" className="form-check-label">
          Admin
        </label>
        <input
          type="checkbox"
          className="form-check-input"
          required
          id="admin"
          autoComplete="off"
          ref={adminRef}
          defaultChecked={false}
        />
      </div>
      <div className="form-check col-sm-2 mb-2">
        <label htmlFor="device" className="form-check-label">
          Device
        </label>
        <input
          type="checkbox"
          className="form-check-input"
          required
          id="device"
          autoComplete="off"
          ref={deviceRef}
          defaultChecked={false}
        />
      </div>
      <label htmlFor="clienti">Clienti</label>
      <select
        className="form-select form-select-sm"
        multiple
        id="clienti"
        placeholder="clienti"
        aria-label="clienti"
        ref={clientiRef}
      >
        {props.clienti
          .filter((cliente) => cliente)
          .map((cliente, index) => (
            <option key={index} value={cliente}>
              {cliente}
            </option>
          ))}
      </select>
      <label htmlFor="postazioni">Postazioni</label>
      <select
        className="form-select form-select-sm"
        multiple
        id="postazioni"
        placeholder="postazioni"
        aria-label="postazioni"
        ref={postazioniRef}
      >
        {props.postazioni
          .filter(({ name }) => name)
          .map(({ name }, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
      </select>
      <button onClick={() => register()} className="btn btn-success">
        Register
      </button>
      <Alert alert={props.alert} closeAlert={props.closeAlert} />
    </div>
  );
};

export default Register;

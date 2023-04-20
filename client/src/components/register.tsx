import { useQuery } from "@tanstack/react-query";
import React from "react";
import UserDataService from "../services/user";
import BadgeDataService from "../services/badge";
import { toast } from "react-hot-toast";
import { axiosErrHandl } from "../utils/axiosErrHandl";
import { RegisterFormState, TPostazione } from "../types";

export default function Register() {
  const postazioni = useQuery({
    queryKey: ["postazioni"],
    queryFn: async () => {
      const response = await BadgeDataService.getPostazioni();
      console.log("queryPostazioni | response:", response);
      const result = response.data.data as TPostazione[];
      return result;
    },
  });

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: async () => {
      const response = await BadgeDataService.getClienti();
      console.log("queryClienti | response:", response);
      const result = response.data.data as string[];
      return result;
    },
  });

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
        console.log("register |", response.data);
        toast.success(response.data.msg);
      })
      .catch((err) => axiosErrHandl(err, "register"))
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
        {clienti.data
          ?.filter((cliente) => cliente)
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
        {postazioni.data
          ?.filter(({ cliente, name }) => cliente && name)
          .map(({ _id, cliente, name }) => (
            <option key={_id} value={_id}>
              {cliente} - {name}
            </option>
          ))}
      </select>
      <button onClick={() => register()} className="btn btn-success">
        Register
      </button>
    </div>
  );
}

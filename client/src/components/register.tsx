/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import UserDataService from "../services/user";
import { Nullable } from "../types/Nullable";
import { RegisterFormState } from "../types/RegisterFormState";
import { TAlert } from "../types/TAlert";
import Alert from "./alert";

type Props = {
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
};

const Register: React.FC<Props> = (props: Props) => {
  const initialRegisterFormState: RegisterFormState = {
    username: "",
    password: "",
    admin: false
  };

  const [registerForm, setRegisterForm] = React.useState<RegisterFormState>(
    initialRegisterFormState
  );

  const handleInputChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    if(type === "checkbox")
      return;
    setRegisterForm({ ...registerForm, [name]: value });
  };

  const handleCheckboxChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type } = event.target;
    if(type !== "checkbox")
      return;
    setRegisterForm({ ...registerForm, [name]: checked });
  }

  const register = () => {
    UserDataService.register(registerForm)
      .then((response) => {
        console.log(response.data);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
      })
      .catch((err) => {
        console.log(err);
        if(err.response) {
          const { success, msg } = err.response.data;
          props.setAlert({ success, msg });
        }
      });
  };

  return (
    <div className="submit-form">
      <h2>Registra Nuovo Account</h2>
      <div className="form-group col-sm-2">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          className="form-control form-control-sm"
          id="username"
          required
          value={registerForm.username}
          onChange={handleInputChanges}
          name="username"
          autoComplete="off"
        />
      </div>
      <div className="form-group col-sm-2">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control form-control-sm"
          id="password"
          required
          value={registerForm.password}
          onChange={handleInputChanges}
          name="password"
          autoComplete="off"
        />
      </div>
      <div className="form-check col-sm-2">
        <label htmlFor="admin" className="form-check-label">
          Admin
        </label>
        <input
          type="checkbox"
          className="form-check-input"
          onChange={handleCheckboxChanges}
          required
          value={Number(registerForm.admin)}
          name="admin"
          id="admin"
          autoComplete="off"
        />
      </div>
      <button onClick={() => register()} className="btn btn-success">
        Register
      </button>
      <Alert alert={props.alert} setAlert={props.setAlert} />
    </div>
  );
};

export default Register;
import React from "react";
import UserDataService from "../../services/user";
import "./index.css";
import Alert from "../alert";
import { User } from "../../types/User";
import { TAlert } from "../../types/TAlert";
import { LoginFormState } from "../../types/LoginFormState";
import { useNavigate } from "react-router-dom";
import { Nullable } from "../../types/Nullable";
import { axiosErrHandl } from "../../utils/axiosErrHandl";

type Props = {
  login: (user: User, cliente: string, postazione: string, token: string[]) => Promise<void>;
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
};

const Login: React.FC<Props> = (props: Props) => {
  const initialLoginFormState: LoginFormState = {
    username: "",
    password: "",
    cliente: "",
    postazione: "",
  };

  const [loginForm, setLoginForm] = React.useState<LoginFormState>(
    initialLoginFormState
  );

  const handleInputChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const navigate = useNavigate();

  const login = () => {
    UserDataService.login(loginForm)
      .then((response) => {
        if (response.data.success === true) {
          console.log(
            `Logged In. uname: ${response.data.data.name} - admin: ${response.data.data.admin} - postazione: ${loginForm.postazione}`
          );

          props.login(response.data.data as User, loginForm.cliente, loginForm.postazione, [
            response.headers["guest-token"] as string,
            response.headers["admin-token"] as string,
          ]);
          navigate("../home");
        }
      })
      .catch(err => axiosErrHandl(err, props.setAlert, "login | "));
  };

  return (
    <div className="login-wrapper">
      <div className="submit-form login-form login-center">
      <div className="form-group col-sm-8 login-child">
          <label htmlFor="cliente" className="col-form-label">
            Cliente
          </label>
          <input
            type="text"
            className="form-control"
            id="cliente"
            required
            value={loginForm.cliente}
            name="cliente"
            onChange={handleInputChanges}
            autoComplete="off"
          />
        </div>
        <div className="form-group col-sm-8 login-child">
          <label htmlFor="postazione" className="col-form-label">
            Postazione
          </label>
          <input
            type="text"
            className="form-control"
            id="postazione"
            required
            value={loginForm.postazione}
            name="postazione"
            onChange={handleInputChanges}
            autoComplete="off"
          />
        </div>
        <div className="form-group col-sm-8 login-child">
          <label htmlFor="username" className="col-form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            required
            value={loginForm.username}
            name="username"
            onChange={handleInputChanges}
            autoComplete="off"
          />
        </div>
        <div className="form-group col-sm-8 login-child">
          <label htmlFor="password" className="col-form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            required
            value={loginForm.password}
            name="password"
            onChange={handleInputChanges}
            autoComplete="off"
          />
        </div>
        <br />
        <div className="form-group col-sm-2 login-child">
          <button onClick={login} className="btn btn-success">
            Login
          </button>
        </div>
      </div>
      <div className="login-alert-wrapper">
        <Alert alert={props.alert} setAlert={props.setAlert} />
      </div>
    </div>
  );
};

export default Login;
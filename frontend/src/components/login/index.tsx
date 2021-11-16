import React from "react";
import UserDataService from "../../services/user.js";
import "./index.css";
import Alert from "../alert.jsx";
import { User } from "../../types/User.js";
import { TAlert } from "../../types/TAlert.js";
import { LoginFormState } from "../../types/LoginFormState.js";
import { RouteComponentProps } from "react-router";
import { Nullable } from "../../types/Nullable.js";

interface Props extends RouteComponentProps<any> {
  login: (user?: User) => Promise<void>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
};

const Login: React.FC<Props> = (props: Props) => {
  const initialLoginFormState: LoginFormState = {
    username: "",
    password: "",
    postazione: "",
  };

  const [loginForm, setLoginForm] = React.useState<LoginFormState>(initialLoginFormState);

  const handleInputChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const login = () => {
    UserDataService.login(loginForm)
      .then((response) => {
        //console.log(`login - response.data: ${response.data}`);
        if (response.data.success === true) {
          console.log(
            `Logged In. uname: ${response.data.data.name} - admin: ${response.data.data.admin} - postazione: ${loginForm.postazione}`
          );
          props.login({ ...response.data.data, postazione: loginForm.postazione });
          props.setToken(response.headers["auth-token"]);
          props.history.push("/home");
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          const { success, msg } = err.response.data;
          props.setAlert({ success, msg });
        }
      });
  };

  return (
    <div className="login-wrapper">
      <div className="submit-form login-form login-center">
      <div className="form-group">
          <label htmlFor="postazione" className="col-sm-2 col-form-label">
            Postazione
          </label>
          <div className="col-sm-7">
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
        </div>
        <div className="form-group">
          <label htmlFor="username" className="col-sm-2 col-form-label">
            Username
          </label>
          <div className="col-sm-7">
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
        </div>
        <div className="form-group">
          <label htmlFor="password" className="col-sm-2 col-form-label">
            Password
          </label>
          <div className="col-sm-7">
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
        </div>
        <br />
        <button onClick={login} className="btn btn-success">
          Login
        </button>
      </div>
      <div className="login-alert-wrapper">
        <Alert {...props} alert={props.alert} setAlert={props.setAlert} />
      </div>
    </div>
  );
};

export default Login;

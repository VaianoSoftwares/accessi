import React from "react";
import UserDataService from "../../services/user";
import "./index.css";
import Alert from "../Alert";
import { TPartialUser, TUser } from "../../types/TUser";
import { TAlert } from "../../types/TAlert";
import { useNavigate } from "react-router-dom";
import { axiosErrHandl } from "../../utils/axiosErrHandl";

type Props = {
  login: (user: TUser) => Promise<void>;
  alert: TAlert | null;
  openAlert: (alert: TAlert) => void;
  closeAlert: () => void;
};

export default function Login(props: Props) {
  const usernameRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    function retriveUser(device: string) {
      UserDataService.getUser(device)
        .then((response) => {
          const dataResp = response.data.data as TPartialUser;
          console.log(dataResp.username, "logged In.");
  
          props.login({
            ...dataResp,
            token: response.headers["x-access-token"]! as string,
          });
        })
        .catch((err) => {
          console.error("retriveUser |", err);
        })
        .finally(() => window.location.hash = "");
    }

    if(window.location.hash) {
      retriveUser(window.location.hash.slice(1));
    }

    window.location.hash = "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login() {
    UserDataService.login({
      username: usernameRef.current!.value,
      password: passwordRef.current!.value,
    })
      .then((response) => {
        if (response.data.success === false) {
          console.error("Login failed.");
          return;
        }

        const dataResp = response.data.data as TPartialUser;
        console.log(dataResp.username, "logged In.");

        props.login({
          ...dataResp,
          token: response.headers["x-access-token"]! as string,
        });

        navigate("/home");
      })
      .catch((err) => axiosErrHandl(err, props.openAlert, "login | "))
      .finally(() => {
        passwordRef.current!.value = passwordRef.current!.defaultValue;
      });
  }

  return (
    <div className="login-wrapper">
      <div className="submit-form login-form login-center">
        <div className="form-group col-sm-8 login-child">
          <label htmlFor="username" className="col-form-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-control"
            required
            defaultValue=""
            autoComplete="off"
            ref={usernameRef}
          />
        </div>
        <div className="form-group col-sm-8 login-child">
          <label htmlFor="password" className="col-form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            required
            defaultValue=""
            autoComplete="off"
            ref={passwordRef}
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
        <Alert alert={props.alert} closeAlert={props.closeAlert} />
      </div>
    </div>
  );
}
import UserDataService from "../../services/user";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useContext } from "react";
import { CurrPostazioneContext, CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";

export default function Login() {
  const navigate = useNavigate();

  const { setCurrentUser } = useContext(CurrentUserContext)!;
  const { setCurrCliente } = useContext(CurrPostazioneContext)!;

  const { handleError } = useError();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function retriveUser() {
      UserDataService.deviceLogin()
        .then((response) => {
          if (response.data.success === false) {
            throw response.data.error;
          }
          const dataResp = response.data.result;
          console.log(dataResp.name, "logged In.");

          setCurrentUser(dataResp);
        })
        .catch((err) => {
          console.error("retriveUser |", err);
        })
        .finally(() => (window.location.hash = ""));
    }

    if (window.location.hash) {
      sessionStorage.setItem(
        "user",
        JSON.stringify({ token: window.location.hash.slice(1) })
      );
      retriveUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login() {
    UserDataService.login({
      name: usernameRef.current!.value,
      password: passwordRef.current!.value,
    })
      .then((response) => {
        if (response.data.success === false) {
          console.error("Login failed.");
          return;
        }

        const dataResp = response.data.result;
        console.log(dataResp.name, "logged In.");

        setCurrentUser(dataResp);
        setCurrCliente(dataResp.clienti[0]);

        navigate("/home");
      })
      .catch((err) => handleError(err, "login"))
      .finally(() => {
        passwordRef.current!.value = passwordRef.current!.defaultValue;
      });
  }

  return (
    <div className="login-wrapper">
      <div className="submit-form login-form login-center">
        <img className="login-logo" src="/logo.png" />
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
    </div>
  );
}

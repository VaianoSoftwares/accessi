import UserDataService from "../../services/user";
import "../../../public/login_wallpaper.jpg";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { useRef, useEffect } from "react";
import { TPartialUser, TUser } from "../../types";

export default function Login(props: {
  login: (user: TUser) => Promise<void>;
}) {
  const navigate = useNavigate();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function retriveUser({
      device,
      password,
    }: {
      device: string;
      password: string;
    }) {
      UserDataService.deviceLogin({ device, password })
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
        .finally(() => (window.location.hash = ""));
    }

    if (window.location.hash) {
      retriveUser(JSON.parse(window.location.hash.slice(1)));
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
      .catch((err) => axiosErrHandl(err, "login"))
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
    </div>
  );
}

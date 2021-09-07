import React from "react";
import UserDataService from "../../services/user.js";
import "./index.css";
import Alert from "../alert.js";

const Login = (props) => {
  const initialLoginFormState = {
    username: "",
    password: "",
    postazione: "",
  };

  const [loginForm, setLoginForm] = React.useState(initialLoginFormState);

  const handleInputChanges = (event) => {
    const { name, value } = event.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const login = () => {
    const { username, password } = loginForm;
    UserDataService.login(username, password)
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
      <div className="submit-form login-form login-center" align="center">
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
            />
          </div>
        </div>
        <br />
        <button onClick={login} className="btn btn-success">
          Login
        </button>
      </div>
      <div className="login-alert-wrapper">
        <Alert alert={props.alert} setAlert={props.setAlert} />
      </div>
    </div>
  );
};

export default Login;

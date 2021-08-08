import React from "react";
import UserDataService from "../services/user.js";

const Login = props => {
  const initialLoginFormState = {
    username: "",
    password: ""
  };
  
  const [loginForm, setLoginForm] = React.useState(initialLoginFormState);

  const handleInputChanges = event => {
    const { name, value } = event.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const login = () => {
    const { username, password } = loginForm;
    UserDataService.login(username, password)
      .then(response => {
        console.log(`login - response.data: ${response.data}`);
        if(response.data.success === true) {
          props.login(response.data.data);
          props.setToken(response.headers["auth-token"]);
          props.history.push("/home");
        }
      })
      .catch(err => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      });
  };

  return (
    <div className="submit-form">
      <div className="form-group row">
        <label htmlFor="username" className="col-sm-2 col-form-label">
          Username
        </label>
        <div className="col-sm-10">
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
      <div className="form-group row">
        <label htmlFor="password" className="col-sm-2 col-form-label">
          password
        </label>
        <div className="col-sm-10">
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
      <button onClick={login} className="btn btn-success">
        Login
      </button>
    </div>
  );
};

export default Login;
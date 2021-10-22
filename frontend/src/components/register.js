/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import UserDataService from "../services/user.js";

const Register = props => {
  const initialRegisterFormState = {
    username: "",
    password: "",
    admin: false
  };

  const [registerForm, setRegisterForm] = React.useState(
    initialRegisterFormState
  );

  React.useEffect(() => {
    UserDataService.token = props.token;
  }, []);

  const handleInputChanges = event => {
    const { name, value, type } = event.target;
    if(type === "checkbox")
      return;
    setRegisterForm({ ...registerForm, [name]: value });
  };

  const handleCheckboxChanges = event => {
    const { name, checked, type } = event.target;
    if(type !== "checkbox")
      return;
    setRegisterForm({ ...registerForm, [name]: checked });
  }

  const register = () => {
    UserDataService.register(registerForm, props.token)
      .then((response) => {
        console.log(response.data);
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
          value={registerForm.admin}
          name="admin"
          id="admin"
        />
      </div>
      <button onClick={() => register()} className="btn btn-success">
        Register
      </button>
    </div>
  );
};

export default Register;
/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import UserDataService from "../services/user.js";
import Navbar from "./accessi-navbar.js";

const Register = props => {
  const initialRegisterFormState = {
    username: "",
    password: "",
    tipoUtente: "guest",
    nominativo: "",
  };

  const [registerForm, setRegisterForm] = React.useState(
    initialRegisterFormState
  );
  const [tipiUtenti, setTipiUtenti] = React.useState([]);

  React.useEffect(() => {
    UserDataService.token = props.token;
    retriveTipiUtenti();
  }, []);

  const retriveTipiUtenti = () => {
    UserDataService.getTipiUtenti()
      .then((response) => {
        console.log(response.data);
        setTipiUtenti(response.data.tipiUtenti);
        const { success, msg } = response.data;
        props.setAlert({ success, msg });
      })
      .catch((err) => {
        console.log(err);
        const { success, msg } = err.response.data;
        props.setAlert({ success, msg });
      });
  };

  const handleInputChanges = event => {
    const { name, value } = event.tager;
    setRegisterForm({ ...registerForm, [name]: value });
  };

  const register = () => {
    UserDataService.register(registerForm, props.token)
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <Navbar {...props} user={props.user} logout={props.logout} />
      <div className="submit-form">
        <div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              required
              value={registerForm.username}
              onChange={handleInputChanges}
              name="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              required
              value={registerForm.password}
              onChange={handleInputChanges}
              name="password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tipo_utente">tipo utente</label>
            <select
              className="form-control"
              onChange={handleInputChanges}
              required
              value={registerForm.tipoUtente}
              name="tipo_utente"
              id="tipo_utente"
            >
              {tipiUtenti.map((tipo, index) => (
                <option value={tipo} key={index}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="nominativo">nominativo</label>
            <input
              type="text"
              className="form-control"
              id="nominativo"
              value={registerForm.nominativo}
              onChange={handleInputChanges}
              name="nominativo"
            />
          </div>
          <button onClick={() => register} className="btn btn-success">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
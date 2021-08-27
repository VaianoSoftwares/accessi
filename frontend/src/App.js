//import logo from './logo.svg';
import './App.css';
import React from "react";
import { Switch, Route, Redirect, BrowserRouter as Router } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./components/home.js";
import Login from "./components/login";
import Register from "./components/register.js";
import Alert from "./components/alert.js";

function App() {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState("");
  const [_alert, setAlert] = React.useState(null);

  const login = async (user = null) => {
    setUser(user);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <div className="App">
      <div className="container-fluid mt-3">
        <Router>
          <Switch>
            <Route exact path={["/", "/home"]}>
              {user ? (
                (props) => (
                  <Home
                    {...props}
                    user={user}
                    logout={logout}
                    token={token}
                    setAlert={setAlert}
                  />
                )
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
            <Route path="/register">
              {user && user.tipo === "admin" ? (
                (props) => (
                  <Register
                    {...props}
                    user={user}
                    logout={logout}
                    token={token}
                    setAlert={setAlert}
                  />
                )
              ) : user ? (
                <Redirect to="/home" />
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
            <Route
              path="/login"
              render={(props) => (
                <Login
                  {...props}
                  login={login}
                  setToken={setToken}
                  setAlert={setAlert}
                />
              )}
            />
          </Switch>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Alert alert={_alert} setAlert={setAlert} />
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;

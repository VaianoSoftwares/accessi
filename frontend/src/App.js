//import logo from './logo.svg';
//import "./App.css";
import React from "react";
import {
  Switch,
  Route,
  Redirect,
  BrowserRouter as Router,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./components/home";
import Login from "./components/login";
import AdminMenu from "./components/admin-menu/admin-menu";

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
                    alert={_alert}
                    setAlert={setAlert}
                  />
                )
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
            <Route path="/admin">
              {user && user.admin === true ? (
                (props) => (
                  <AdminMenu
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
                  alert={_alert}
                  setAlert={setAlert}
                />
              )}
            />
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;

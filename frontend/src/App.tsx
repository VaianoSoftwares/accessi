//Modules
import React from "react";
import {
  Switch,
  Route,
  Redirect,
  BrowserRouter as Router,
  RouteComponentProps
} from "react-router-dom";
// Style
import "bootstrap/dist/css/bootstrap.min.css";
//import logo from './logo.svg';
//import "./App.css";
// Components
import Home from "./components/home";
import Login from "./components/login";
import AdminMenu from "./components/admin-menu/admin-menu";
//Types
import { User } from "./types/User";
import { TAlert } from "./types/TAlert";
import { Nullable } from "./types/Nullable";

const App: React.FC<{}> = () => {
  const [user, setUser] = React.useState<Nullable<User>>(null);
  const [token, setToken] = React.useState("");
  const [_alert, setAlert] = React.useState<Nullable<TAlert>>(null);

  const login = async (user: Nullable<User> = null) => {
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
              {(props: RouteComponentProps<any>) => (user ? (
                <Home
                  {...props}
                  user={user}
                  logout={logout}
                  token={token}
                  alert={_alert}
                  setAlert={setAlert}
                />
              ) : (
                <Redirect to="/login" />
              ))}
            </Route>
            <Route exact path="/admin">
              {(props: RouteComponentProps<any>) => (user && user.admin === true ? (
                <AdminMenu
                  {...props}
                  user={user}
                  logout={logout}
                  token={token}
                  alert={_alert}
                  setAlert={setAlert}
                />
              ) : user ? (
                <Redirect to="/home" />
              ) : (
                <Redirect to="/login" />
              ))}
            </Route>
            <Route
              path="/login"
              render={(props: RouteComponentProps<any>) => (
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

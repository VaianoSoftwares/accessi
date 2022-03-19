//Modules
import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Style
import "bootstrap/dist/css/bootstrap.min.css";
// Components
import Home from "./components/Home";
import Login from "./components/Login";
import AdminMenu from "./components/AdminMenu";
import PageNotFound from "./components/PageNotFound";
//Types
import { User } from "./types/User";
import { TAlert } from "./types/TAlert";
import { Nullable } from "./types/Nullable";

const App: React.FC<{}> = () => {
  const [user, setUser] = React.useState<Nullable<User>>(() => {
    const name = sessionStorage.getItem("username");
    const admin = sessionStorage.getItem("admin");
    if(name || admin) return {
      name,
      admin: Boolean(admin)
    } as User;
    return null;
  });
  const [_alert, setAlert] = React.useState<Nullable<TAlert>>(null);

  const login = async (user: User, postazione: string, tokens: string[]) => {
    sessionStorage.setItem("username", user.name);
    sessionStorage.setItem("admin", user.admin.toString());
    sessionStorage.setItem("postazione", postazione);
    sessionStorage.setItem("guest-token", tokens[0]);
    if(user.admin) sessionStorage.setItem("admin-token", tokens[1]);
    setUser(user);
  };

  const logout = async () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <div className="App">
      <div className="container-fluid mt-3">
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route
            path="home"
            element={
              user ? (
                <Home
                  user={user}
                  logout={logout}
                  alert={_alert}
                  setAlert={setAlert}
                />
              ) : (
                <Navigate replace to="../login" />
              )
            }
          />
          <Route path="/" element={<Navigate replace to="home" />} />
          <Route
            path="admin/*"
            element={
              user && user.admin === true ? (
                <AdminMenu
                  user={user}
                  logout={logout}
                  alert={_alert}
                  setAlert={setAlert}
                />
              ) : user ? (
                <Navigate replace to="../home" />
              ) : (
                <Navigate replace to="../login" />
              )
            }
          />
          <Route
            path="login"
            element={
              <Login
                login={login}
                alert={_alert}
                setAlert={setAlert}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;

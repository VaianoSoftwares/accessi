//Modules
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// Style
import "bootstrap/dist/css/bootstrap.min.css";
// Components
import Home from "./components/Home";
import Login from "./components/Login";
import AdminMenu from "./components/AdminMenu";
import PageNotFound from "./components/PageNotFound";
// Types
import { User } from "./types/User";
import { TAlert } from "./types/TAlert";
import { Nullable } from "./types/Nullable";
import { TipoBadge } from "./enums/TipoBadge";
import { StatoBadge } from "./enums/StatoBadge";
// Services
import BadgeDataService from "./services/badge";
import { Assegnazione } from "./types/Assegnazione";

const App: React.FC<{}> = () => {
  const [tipiBadge, setTipiBadge] = React.useState<TipoBadge[]>([]);
  const [assegnazioni, setAssegnazioni] = React.useState<Assegnazione[]>([]);
  const [tipiDoc, setTipiDoc] = React.useState<string[]>([]);
  const [statiBadge, setStatiBadge] = React.useState<StatoBadge[]>([]);

  const [user, setUser] = React.useState<Nullable<User>>(() => {
    const name = sessionStorage.getItem("username");
    const admin = sessionStorage.getItem("admin");
    if (name || admin)
      return {
        name,
        admin: Boolean(admin),
      } as User;
    return null;
  });
  const [_alert, setAlert] = React.useState<Nullable<TAlert>>(null);

  React.useEffect(() => {
    retriveEnums();
  }, []);

  const login = async (user: User, postazione: string, tokens: string[]) => {
    sessionStorage.setItem("username", user.name);
    sessionStorage.setItem("admin", user.admin.toString());
    sessionStorage.setItem("postazione", postazione);
    sessionStorage.setItem("guest-token", tokens[0]);
    if (user.admin) sessionStorage.setItem("admin-token", tokens[1]);
    setUser(user);
  };

  const logout = async () => {
    sessionStorage.clear();
    setUser(null);
  };

  const retriveEnums = () => {
    BadgeDataService.getEnums()
      .then((response) => {
        const enums = response.data.data;
        setTipiBadge(enums.badge);
        setAssegnazioni(enums.assegnazione);
        setTipiDoc(enums.documento);
        setStatiBadge(enums.stato);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="App">
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
                tipiBadge={tipiBadge}
                assegnazioni={assegnazioni}
                tipiDoc={tipiDoc}
                statiBadge={statiBadge}
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
                tipiBadge={tipiBadge}
                assegnazioni={assegnazioni}
                setAssegnazioni={setAssegnazioni}
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
          element={<Login login={login} alert={_alert} setAlert={setAlert} />}
        />
      </Routes>
    </div>
  );
};

export default App;

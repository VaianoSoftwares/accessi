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
import Permessi from "./components/Permessi";
import AccessiNavbar from "./components/AccessiNavbar";
import Documenti from "./components/Documenti";
import Calendario from "./components/Calendario";
import Chiavi from "./components/Chiavi";

// Types
import { TUser } from "./types/TUser";
import { TAlert } from "./types/TAlert";
import { Nullable } from "./types/Nullable";
import { TAssegnaz } from "./types/TAssegnaz";
import { TEnums } from "./types/TEnums";
import { TBadgeStato, TBadgeTipo, TTDoc } from "./types/Badge";
import { TInStruttTableContent } from "./types/TableContentElem";
import { TInPrestito } from "./types/PrestitoChiavi";

// Services
import UserDataService from "./services/user";
import BadgeDataService from "./services/badge";

// Utils
import Archivio from "./components/Archivio";
import serialPortHandler from "./utils/scannerHandler";
import setSessionStorage from "./utils/setSessionStorage";

const App: React.FC<{}> = () => {
  const [tipiBadge, setTipiBadge] = React.useState<TBadgeTipo[]>([]);
  const [assegnazioni, setAssegnazioni] = React.useState<TAssegnaz[]>([]);
  const [tipiDoc, setTipiDoc] = React.useState<TTDoc[]>([]);
  const [statiBadge, setStatiBadge] = React.useState<TBadgeStato[]>([]);

  const [user, setUser] = React.useState<Nullable<TUser>>(() => {
    const name = sessionStorage.getItem("username");
    const admin = sessionStorage.getItem("admin");
    if (name && admin)
      return {
        name,
        admin: admin === "true",
      } as TUser;
    return null;
  });

  const [alert, setAlert] = React.useState<Nullable<TAlert>>(null);

  function openAlert(alert: TAlert) {
    setAlert(alert);
  }

  function closeAlert() {
    setAlert(null);
  }

  const [accessiScanner, setAccessiScanner] = React.useState<SerialPort>();
  const [timbraVal, setTimbraVal] = React.useState("");

  const [inStrutt, setInStrutt] = React.useState<TInStruttTableContent[]>([]);

  const [chiaviScanner, setChiaviScanner] = React.useState<SerialPort>();
  const [prestaArr, setPrestaArr] = React.useState<string[]>([]);

  function prestaArrAdd(value: string) {
    setPrestaArr((prevState) => Array.from(new Set([value, ...prevState])));
  }

  function prestaArrRemove(value: string) {
    setPrestaArr((prevState) => prevState.filter((elem) => elem !== value));
  }

  const [inPrestito, setInPrestito] = React.useState(new Array<TInPrestito>());

  async function login(
    user: TUser,
    tokens: string[]
  ) {
    setSessionStorage(user);
    sessionStorage.setItem("guest-token", tokens[0]);
    if (user.admin) sessionStorage.setItem("admin-token", tokens[1]);

    setUser(user);
  }

  async function logout() {
    try {
      const response = await UserDataService.logout();
      console.log("logout |", response.data);
    } catch(err) {
      console.error("logout |", err);
    } finally {
      sessionStorage.clear();
      setUser(null);
    }
  }

  function retriveEnums() {
    BadgeDataService.getEnums()
      .then((response) => {
        const enums = response.data.data as TEnums;
        setTipiBadge(enums.badge);
        setAssegnazioni(enums.assegnazione);
        setTipiDoc(enums.documento);
        setStatiBadge(enums.stato);
      })
      .catch((err) => {
        console.error("retriveEnums |", err);
      });
  }

  function retriveSession() {
    UserDataService.getSession()
      .then((response) => {
        const user = response.data.data as TUser;
        if(!user) return;
        setSessionStorage(user);
        setUser(user);
      })
      .catch((err) => {
        console.error("retriveSession |", err);
      });
  }

  async function runAccessiScanner() {
    await serialPortHandler(
      (value: string) => setTimbraVal(value),
      setAccessiScanner,
      openAlert
    );
  }

  async function runChiaviScanner() {
    await serialPortHandler(prestaArrAdd, setChiaviScanner, openAlert);
  }

  React.useEffect(() => {
    retriveEnums();
    retriveSession();
  }, []);

  return (
    <div className="App">
      <AccessiNavbar user={user} logout={logout} />
      <Routes>
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="home"
          element={
            user ? (
              <Home
                user={user}
                alert={alert}
                openAlert={openAlert}
                closeAlert={closeAlert}
                tipiBadge={tipiBadge}
                assegnazioni={assegnazioni}
                tipiDoc={tipiDoc}
                statiBadge={statiBadge}
                inStrutt={inStrutt}
                setInStrutt={setInStrutt}
                scannedValue={timbraVal}
                clearScannedValue={() => setTimbraVal("")}
                scannerConnected={accessiScanner !== undefined}
                runScanner={runAccessiScanner}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate replace to="/home" />} />
        <Route
          path="chiavi"
          element={
            user ? (
              <Chiavi
                inPrestito={inPrestito}
                setInPrestito={setInPrestito}
                scannerConnected={chiaviScanner !== undefined}
                runScanner={runChiaviScanner}
                scanValues={prestaArr}
                addScanValue={prestaArrAdd}
                removeScanValue={prestaArrRemove}
                clearScanValues={() => setPrestaArr([])}
                alert={alert}
                openAlert={openAlert}
                closeAlert={closeAlert}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="archivio"
          element={
            user && user.admin === true ? (
              <Archivio />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="calendario"
          element={
            user ? (
              <Calendario admin={user.admin} />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="permessi"
          element={
            user ? (
              <Permessi
                user={user}
                alert={alert}
                openAlert={openAlert}
                closeAlert={closeAlert}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="documenti"
          element={
            user ? (
              <Documenti
                alert={alert}
                openAlert={openAlert}
                closeAlert={closeAlert}
                admin={user.admin}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="admin/*"
          element={
            user && user.admin === true ? (
              <AdminMenu
                user={user}
                logout={logout}
                alert={alert}
                openAlert={openAlert}
                closeAlert={closeAlert}
                tipiBadge={tipiBadge}
                assegnazioni={assegnazioni}
                setAssegnazioni={setAssegnazioni}
              />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="login"
          element={
            !user ? (
              <Login
                login={login}
                alert={alert}
                openAlert={openAlert}
                closeAlert={closeAlert}
              />
            ) : (
              <Navigate replace to="/home" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;

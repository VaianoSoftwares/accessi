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
import Archivio from "./components/Archivio";

// Types
import { TUser } from "./types/TUser";
import { TAlert } from "./types/TAlert";
import { TEnums } from "./types/TEnums";

// Services
import BadgeDataService from "./services/badge";

// Utils
import serialPortHandler from "./utils/scannerHandler";
import SSHandler from "./utils/SSHandler";
import { TAssegnazione } from "./types/TAssegnazione";
import { TPostazione } from "./types/TPostazione";

const enumsInitState: TEnums = {
  badge: [],
  stato: [],
  documento: [],
  assegnazione: [],
  cliente: [],
  postazione: [],
};

export default function App() {
  const [enums, setEnums] = React.useState<TEnums>(enumsInitState);

  React.useEffect(() => {
    retriveEnums();
  }, []);

  const [user, setUser] = React.useState<TUser | null>(SSHandler.getUserFromStorage());
  const [alert, setAlert] = React.useState<TAlert | null>(null);

  function addAssegnazione(assegnazione: TAssegnazione) {
    setEnums((prev) => {
      prev!.assegnazione.push(assegnazione);
      return prev;
    });
  }

  function removeAssegnazione(name: string) {
    setEnums((prev) => {
      prev!.assegnazione = prev!.assegnazione.filter((a) => a.name !== name);
      return prev;
    });
  }

  function addPostazione(postazione: TPostazione) {
    setEnums((prev) => {
      prev!.postazione.push(postazione);
      return prev;
    })
  }

  function removePostazione(name: string) {
    setEnums((prev) => {
      prev!.postazione = prev!.postazione.filter((a) => a.name !== name);
      return prev;
    });
  }

  function openAlert(alert: TAlert) {
    setAlert(alert);
  }

  function closeAlert() {
    setAlert(null);
  }

  const [accessiScanner, setAccessiScanner] = React.useState<SerialPort>();
  const [timbraVal, setTimbraVal] = React.useState("");

  const [chiaviScanner, setChiaviScanner] = React.useState<SerialPort>();
  const [prestaArr, setPrestaArr] = React.useState<string[]>([]);

  function prestaArrAdd(value: string) {
    setPrestaArr((prevState) => Array.from(new Set([value, ...prevState])));
  }

  function prestaArrRemove(value: string) {
    setPrestaArr((prevState) => prevState.filter((elem) => elem !== value));
  }

  async function login(user: TUser) {
    SSHandler.setSessionStorage(user);
    if (user.admin === true && enums.postazione[0])
      SSHandler.setPostazione(enums.postazione[0].name);
    setUser(user);
  }

  async function logout() {
    sessionStorage.clear();
    setUser(null);
  }

  function retriveEnums() {
    BadgeDataService.getEnums()
      .then((response) => {
        const enumsResp = response.data.data as TEnums;
        console.log("retriveEnums |", enumsResp);
        setEnums(enumsResp);
      })
      .catch((err) => {
        console.error("retriveEnums |", err);
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
                assegnazioni={enums.assegnazione}
                clienti={enums.cliente}
                postazioni={enums.postazione}
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
              <Archivio
                assegnazioni={enums.assegnazione}
                clienti={enums.cliente}
                postazioni={enums.postazione}
              />
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
                assegnazioni={enums.assegnazione}
                addAssegnazione={addAssegnazione}
                removeAssegnazione={removeAssegnazione}
                clienti={enums.cliente}
                postazioni={enums.postazione}
                addPostazione={addPostazione}
                removePostazione={removePostazione}
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
}

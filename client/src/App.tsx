//Modules
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Style
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Types
import { TUser } from "./types";

// Components
import Badge from "./components/Badge";
import Login from "./components/Login";
import PageNotFound from "./components/PageNotFound";
import Permessi from "./components/Permessi";
import AccessiNavbar from "./components/AccessiNavbar";
import Documenti from "./components/Documenti";
import Calendario from "./components/Calendario";
import Chiavi from "./components/Chiavi";
import Archivio from "./components/Archivio";
import Home from "./components/Home";
import Assegnazioni from "./components/Assegnazioni";
import Postazioni from "./components/Postazioni";
import Register from "./components/Register";
import UserEdit from "./components/UserEdit";
import UsersList from "./components/UsersList";

// Utils
import serialPortHandler from "./utils/scannerHandler";
import useSessionStorage from "./hooks/useSessionStorage";
import { ErrorBoundary } from "react-error-boundary";
import { axiosErrHandl } from "./utils/axiosErrHandl";

export default function App() {
  const [user, setUser] = useSessionStorage<TUser | null>("user", null);

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
    setUser(user);
  }

  async function logout() {
    sessionStorage.clear();
    setUser(null);
  }

  async function runAccessiScanner() {
    await serialPortHandler(
      (value: string) => setTimbraVal(value),
      setAccessiScanner
    );
  }

  async function runChiaviScanner() {
    await serialPortHandler(prestaArrAdd, setChiaviScanner);
  }

  return (
    <div className="App">
      {user && <AccessiNavbar user={user} logout={logout} />}
      <Routes>
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="home"
          element={
            user ? <Home user={user} /> : <Navigate replace to="/login" />
          }
        />
        <Route path="/" element={<Navigate replace to="/home" />} />
        <Route
          path="badge"
          element={
            user && (user.admin || user.pages?.includes("badge")) ? (
              <ErrorBoundary
                FallbackComponent={({ error, resetErrorBoundary }) => (
                  <div role="alert">
                    <p>Something went wrong:</p>
                    <pre>{error.message}</pre>
                    <button onClick={resetErrorBoundary}>Try again</button>
                  </div>
                )}
                onError={(error) => axiosErrHandl(error, "Badge")}
              >
                <Badge
                  user={user}
                  scannedValue={timbraVal}
                  clearScannedValue={() => setTimbraVal("")}
                  scannerConnected={accessiScanner !== undefined}
                  runScanner={runAccessiScanner}
                  tipoBadge={"BADGE"}
                />
              </ErrorBoundary>
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="chiavi"
          element={
            user && (user.admin || user.pages?.includes("chiavi")) ? (
              <Chiavi
                scannerConnected={chiaviScanner !== undefined}
                runScanner={runChiaviScanner}
                scanValues={prestaArr}
                addScanValue={prestaArrAdd}
                removeScanValue={prestaArrRemove}
                clearScanValues={() => setPrestaArr([])}
              />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="veicoli"
          element={
            user && (user.admin || user.pages?.includes("veicoli")) ? (
              <Badge
                user={user}
                scannedValue={timbraVal}
                clearScannedValue={() => setTimbraVal("")}
                scannerConnected={accessiScanner !== undefined}
                runScanner={runAccessiScanner}
                tipoBadge={"VEICOLO"}
              />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="archivio"
          element={
            user && (user.admin || user.pages?.includes("archivio")) ? (
              <Archivio tipoArchivio="BADGE" />
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
            user && (user.admin || user.pages?.includes("calendario")) ? (
              <Calendario admin={user.admin} />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="permessi"
          element={
            user && (user.admin || user.pages?.includes("permessi")) ? (
              <Permessi user={user} />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="documenti"
          element={
            user && (user.admin || user.pages?.includes("documenti")) ? (
              <Documenti admin={user.admin} />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="admin/register"
          element={
            user && user.admin === true ? (
              <Register />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="admin/"
          element={<Navigate replace to="admin/register" />}
        />
        <Route
          path="admin/users"
          element={
            user && user.admin === true ? (
              <UsersList />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="admin/users/:userId"
          element={
            user && user.admin === true ? (
              <UserEdit />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="admin/assegnazioni"
          element={
            user && user.admin === true ? (
              <Assegnazioni />
            ) : user ? (
              <Navigate replace to="/home" />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="admin/postazioni"
          element={
            user && user.admin === true ? (
              <Postazioni />
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
            !user ? <Login login={login} /> : <Navigate replace to="/home" />
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
}

import { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { TPostazione, TUser } from "./types";
import Login from "./components/Login";
import PageNotFound from "./components/PageNotFound";
import AccessiNavbar from "./components/AccessiNavbar";
import Home from "./components/Home";
import serialPortHandler from "./utils/scannerHandler";
import useSessionStorage from "./hooks/useSessionStorage";
import Loader from "./components/Loader";

const Badge = lazy(() => import("./components/Badge"));
const Chiavi = lazy(() => import("./components/Chiavi"));
const Archivio = lazy(() => import("./components/Archivio"));
const Permessi = lazy(() => import("./components/Permessi"));
const Documenti = lazy(() => import("./components/Documenti"));
const Calendario = lazy(() => import("./components/Calendario"));
const Register = lazy(() => import("./components/Register"));
const UserEdit = lazy(() => import("./components/UserEdit"));
const UsersList = lazy(() => import("./components/UsersList"));
const Assegnazioni = lazy(() => import("./components/Assegnazioni"));
const Postazioni = lazy(() => import("./components/Postazioni"));
const Clienti = lazy(() => import("./components/Clienti"));

export default function App() {
  const [user, setUser] = useSessionStorage<TUser | null>("user", null);

  const [currPostazione, setCurrPostazione] = useState<TPostazione>();

  const [accessiScanner, setAccessiScanner] = useState<SerialPort>();
  const [timbraVal, setTimbraVal] = useState("");

  const [chiaviScanner, setChiaviScanner] = useState<SerialPort>();
  const [prestaArr, setPrestaArr] = useState<string[]>([]);

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
      {user && (
        <AccessiNavbar
          user={user}
          logout={logout}
          currPostazione={currPostazione}
          setCurrPostazione={setCurrPostazione}
          badgeScannerConnected={accessiScanner !== undefined}
          runBadgeScanner={runAccessiScanner}
          chiaviScannerConnected={chiaviScanner !== undefined}
          runChiaviScanner={runChiaviScanner}
        />
      )}
      <Routes>
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="home"
          element={
            user ? <Home user={user} /> : <Navigate replace to="/login" />
          }
        />
        <Route index element={<Navigate replace to="/home" />} />
        <Route
          path="badge"
          element={
            user && (user.admin || user.pages?.includes("badge")) ? (
              <Suspense fallback={<Loader />}>
                <Badge
                  user={user}
                  scannedValue={timbraVal}
                  clearScannedValue={() => setTimbraVal("")}
                  tipoBadge={"BADGE"}
                  currPostazione={currPostazione}
                />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="chiavi"
          element={
            user && (user.admin || user.pages?.includes("chiavi")) ? (
              <Suspense fallback={<Loader />}>
                <Chiavi
                  user={user}
                  scanValues={prestaArr}
                  addScanValue={prestaArrAdd}
                  removeScanValue={prestaArrRemove}
                  clearScanValues={() => setPrestaArr([])}
                  currPostazione={currPostazione}
                />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="veicoli"
          element={
            user && (user.admin || user.pages?.includes("veicoli")) ? (
              <Suspense fallback={<Loader />}>
                <Badge
                  user={user}
                  scannedValue={timbraVal}
                  clearScannedValue={() => setTimbraVal("")}
                  tipoBadge={"VEICOLO"}
                  currPostazione={undefined}
                />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="archivio"
          element={
            user && (user.admin || user.pages?.includes("archivio")) ? (
              <Suspense fallback={<Loader />}>
                <Archivio tipoArchivio="BADGE" />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="calendario"
          element={
            user && (user.admin || user.pages?.includes("calendario")) ? (
              <Suspense fallback={<Loader />}>
                <Calendario admin={user.admin} />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="permessi"
          element={
            user && (user.admin || user.pages?.includes("permessi")) ? (
              <Suspense fallback={<Loader />}>
                <Permessi user={user} />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="documenti"
          element={
            user && (user.admin || user.pages?.includes("documenti")) ? (
              <Suspense fallback={<Loader />}>
                <Documenti admin={user.admin} />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="admin/register"
          element={
            user?.admin ? (
              <Suspense fallback={<Loader />}>
                <Register />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route path="admin" element={<Navigate replace to="register" />} />
        <Route
          path="admin/users"
          element={
            user?.admin ? (
              <Suspense fallback={<Loader />}>
                <UsersList />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="admin/users/:userId"
          element={
            user?.admin ? (
              <Suspense fallback={<Loader />}>
                <UserEdit />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="admin/assegnazioni"
          element={
            user?.admin ? (
              <Suspense fallback={<Loader />}>
                <Assegnazioni />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="admin/postazioni"
          element={
            user?.admin ? (
              <Suspense fallback={<Loader />}>
                <Postazioni />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="admin/clienti"
          element={
            user?.admin ? (
              <Suspense fallback={<Loader />}>
                <Clienti />
              </Suspense>
            ) : (
              <PageNotFound />
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

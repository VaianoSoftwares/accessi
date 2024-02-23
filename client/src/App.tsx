import { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Login from "./components/Login";
import PageNotFound from "./components/PageNotFound";
import AccessiNavbar from "./components/AccessiNavbar";
import Home from "./components/Home";
import serialPortHandler from "./utils/scannerHandler";
import useSessionStorage from "./hooks/useSessionStorage";
import Loader from "./components/Loader";
import { canAccessPage, isAdmin, TLoggedUser } from "./types/users";
import { TPages } from "./types/pages";
import { Postazione } from "./types/badges";

const Badge = lazy(() => import("./components/Badge"));
const Chiavi = lazy(() => import("./components/Chiavi"));
const Archivio = lazy(() => import("./components/Archivio"));
const Protocollo = lazy(() => import("./components/Protocollo"));
const Anagrafico = lazy(() => import("./components/Anagrafico"));
const Register = lazy(() => import("./components/Register"));
const UserEdit = lazy(() => import("./components/UserEdit"));
const UsersList = lazy(() => import("./components/UsersList"));
const Assegnazioni = lazy(() => import("./components/Assegnazioni"));
const Postazioni = lazy(() => import("./components/Postazioni"));
const Clienti = lazy(() => import("./components/Clienti"));

export default function App() {
  const [user, setUser] = useSessionStorage<TLoggedUser | null>("user", null);

  const [currPostazione, setCurrPostazione] = useState<Postazione>();

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

  async function login(user: TLoggedUser) {
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
            user && canAccessPage(user, TPages.badge) ? (
              <Suspense fallback={<Loader />}>
                <Badge
                  user={user}
                  scannedValue={timbraVal}
                  clearScannedValue={() => setTimbraVal("")}
                  tipoBadge={"NOMINATIVO"}
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
            user && canAccessPage(user, TPages.chiavi) ? (
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
            user && canAccessPage(user, TPages.veicoli) ? (
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
            user && canAccessPage(user, TPages.archivio) ? (
              <Suspense fallback={<Loader />}>
                <Archivio user={user} />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="protocollo"
          element={
            user && canAccessPage(user, TPages.protocollo) ? (
              <Suspense fallback={<Loader />}>
                <Protocollo user={user} currPostazione={currPostazione} />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="anagrafico"
          element={
            user && canAccessPage(user, TPages.anagrafico) ? (
              <Suspense fallback={<Loader />}>
                <Anagrafico user={user} />
              </Suspense>
            ) : (
              <PageNotFound />
            )
          }
        />
        <Route
          path="admin/register"
          element={
            user && isAdmin(user) ? (
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
            user && isAdmin(user) ? (
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
            user && isAdmin(user) ? (
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
            user && isAdmin(user) ? (
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
            user && isAdmin(user) ? (
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
            user && isAdmin(user) ? (
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

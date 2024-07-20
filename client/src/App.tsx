import { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Login from "./components/Login";
import PageNotFound from "./components/PageNotFound";
import AccessiNavbar from "./components/AccessiNavbar";
import Home from "./components/Home";
import Loader from "./components/Loader";
import RootProvider from "./components/RootProvider";
import { canAccessPage, isAdmin } from "./types/users";
import { TPages } from "./types/pages";
import { BadgeType, Postazione } from "./types/badges";
import useCurrentUser from "./hooks/useCurrentUser";
import scannerHandler from "./utils/scannerHandler";

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
  const { currentUser, setCurrentUser, removeCurrentUser } = useCurrentUser();

  const [currCliente, setCurrCliente] = useState<string>();
  const [currPostazione, setCurrPostazione] = useState<Postazione>();
  function clearCurrPostazione() {
    setCurrPostazione(undefined);
  }

  const [isBadgeScannerConnected, setIsBadgeScannerConnected] = useState(false);
  const [timbraVal, setTimbraVal] = useState("");

  const [isChiaviScannerConnected, setIsChiaviScannerConnected] =
    useState(false);
  const [prestaArr, setPrestaArr] = useState<string[]>([]);

  function prestaArrAdd(value: string) {
    setPrestaArr((prevState) => Array.from(new Set([value, ...prevState])));
  }

  function prestaArrRemove(value: string) {
    setPrestaArr((prevState) => prevState.filter((elem) => elem !== value));
  }

  async function runAccessiScanner() {
    await scannerHandler(
      (value: string) => setTimbraVal(value),
      setIsBadgeScannerConnected
    );
  }

  async function runChiaviScanner() {
    await scannerHandler(prestaArrAdd, setIsChiaviScannerConnected);
  }

  return (
    <div className="App">
      <RootProvider
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        removeCurrentUser={removeCurrentUser}
      >
        <>
          {currentUser && (
            <AccessiNavbar
              currCliente={currCliente}
              setCurrCliente={setCurrCliente}
              currPostazione={currPostazione}
              setCurrPostazione={setCurrPostazione}
              badgeScannerConnected={isBadgeScannerConnected}
              runBadgeScanner={runAccessiScanner}
              chiaviScannerConnected={isChiaviScannerConnected}
              runChiaviScanner={runChiaviScanner}
            />
          )}
          <Routes>
            <Route path="*" element={<PageNotFound />} />
            <Route
              path="home"
              element={
                currentUser ? <Home /> : <Navigate replace to="/login" />
              }
            />
            <Route index element={<Navigate replace to="/home" />} />
            <Route
              path="badge"
              element={
                canAccessPage(currentUser, TPages.badge) ? (
                  <Suspense fallback={<Loader />}>
                    <Badge
                      scannedValue={timbraVal}
                      clearScannedValue={() => setTimbraVal("")}
                      tipoBadge={BadgeType.NOMINATIVO}
                      currPostazione={currPostazione}
                      clearCurrPostazione={clearCurrPostazione}
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
                canAccessPage(currentUser, TPages.chiavi) ? (
                  <Suspense fallback={<Loader />}>
                    <Chiavi
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
                canAccessPage(currentUser, TPages.veicoli) ? (
                  <Suspense fallback={<Loader />}>
                    <Badge
                      scannedValue={timbraVal}
                      clearScannedValue={() => setTimbraVal("")}
                      tipoBadge={BadgeType.VEICOLO}
                      currPostazione={currPostazione}
                      clearCurrPostazione={clearCurrPostazione}
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
                canAccessPage(currentUser, TPages.archivio) ? (
                  <Suspense fallback={<Loader />}>
                    <Archivio />
                  </Suspense>
                ) : (
                  <PageNotFound />
                )
              }
            />
            <Route
              path="protocollo"
              element={
                canAccessPage(currentUser, TPages.protocollo) ? (
                  <Suspense fallback={<Loader />}>
                    <Protocollo currPostazione={currPostazione} />
                  </Suspense>
                ) : (
                  <PageNotFound />
                )
              }
            />
            <Route
              path="anagrafico"
              element={
                canAccessPage(currentUser, TPages.anagrafico) ? (
                  <Suspense fallback={<Loader />}>
                    <Anagrafico currCliente={currCliente} />
                  </Suspense>
                ) : (
                  <PageNotFound />
                )
              }
            />
            <Route
              path="admin/register"
              element={
                isAdmin(currentUser) ? (
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
                isAdmin(currentUser) ? (
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
                isAdmin(currentUser) ? (
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
                isAdmin(currentUser) ? (
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
                isAdmin(currentUser) ? (
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
                isAdmin(currentUser) ? (
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
                currentUser === null ? (
                  <Login />
                ) : (
                  <Navigate replace to="/home" />
                )
              }
            />
          </Routes>
          <Toaster />
        </>
      </RootProvider>
    </div>
  );
}

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
import { canAccessPage } from "./types/users";
import { TAdminPages, TPages } from "./types/pages";
import { BadgeType } from "./types/badges";
import useCurrentUser from "./hooks/useCurrentUser";
import scannerHandler from "./utils/scannerHandler";
import usePostazione from "./hooks/usePostazione";
import useArray from "./hooks/useArray";
import useBool from "./hooks/useBool";
// import { WSSendMsg } from "./services/ws";

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

  const {
    currCliente,
    setCurrCliente,
    clearCurrCliente,
    currPostazione,
    setCurrPostazione,
    clearCurrPostazione,
  } = usePostazione();

  const [
    isBadgeScannerConnected,
    { setTrue: setBadgeScannerTrue, setFalse: setBadgeScannerFalse },
  ] = useBool(false);
  const [timbraVal, setTimbraVal] = useState("");

  const [
    isChiaviScannerConnected,
    { setTrue: setChiaviScannerTrue, setFalse: setChiaviScannerFalse },
  ] = useBool(false);
  const {
    array: prestaArr,
    addElement: prestaArrAdd,
    removeElement: prestaArrRemove,
    clearArray: clearPrestaArr,
  } = useArray<string>();

  async function runAccessiScanner() {
    await scannerHandler(
      (value: string) => setTimbraVal(value),
      setBadgeScannerTrue,
      setBadgeScannerFalse
    );
  }

  async function runChiaviScanner() {
    await scannerHandler(
      prestaArrAdd,
      setChiaviScannerTrue,
      setChiaviScannerFalse
    );
  }

  // useEffect(() => {
  //   WSSendMsg("patara");
  // }, []);

  return (
    <div className="App">
      <RootProvider
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        removeCurrentUser={removeCurrentUser}
        currCliente={currCliente}
        setCurrCliente={setCurrCliente}
        clearCurrCliente={clearCurrCliente}
        currPostazione={currPostazione}
        setCurrPostazione={setCurrPostazione}
        clearCurrPostazione={clearCurrPostazione}
      >
        <>
          {currentUser && (
            <AccessiNavbar
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
                      clearScanValues={clearPrestaArr}
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
                    <Protocollo />
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
                    <Anagrafico />
                  </Suspense>
                ) : (
                  <PageNotFound />
                )
              }
            />
            <Route
              path="admin/register"
              element={
                canAccessPage(currentUser, TAdminPages.register) ? (
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
                canAccessPage(currentUser, TAdminPages.users) ? (
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
                canAccessPage(currentUser, TAdminPages.users) ? (
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
                canAccessPage(currentUser, TAdminPages.assegnazioni) ? (
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
                canAccessPage(currentUser, TAdminPages.postazioni) ? (
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
                canAccessPage(currentUser, TAdminPages.clienti) ? (
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

import { lazy, Suspense } from "react";
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
import { TPages } from "./types/pages";
import { BadgeType } from "./types/badges";
import useCurrentUser from "./hooks/useCurrentUser";
import usePostazione from "./hooks/usePostazione";
import useSerialScanner from "./hooks/useSerialScanner";
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
  const loggedUser = useCurrentUser();

  const selectedPostazione = usePostazione();

  const badgeScanner = useSerialScanner();
  const chiaviScanner = useSerialScanner();

  return (
    <div className="App">
      <RootProvider
        loggedUser={loggedUser}
        selectedPostazione={selectedPostazione}
      >
        <>
          {loggedUser.currentUser && (
            <AccessiNavbar
              badgeScannerConnected={badgeScanner.isConnected}
              runBadgeScanner={badgeScanner.connect}
              chiaviScannerConnected={chiaviScanner.isConnected}
              runChiaviScanner={chiaviScanner.connect}
            />
          )}
          <Routes>
            <Route path="*" element={<PageNotFound />} />
            <Route
              path="home"
              element={
                loggedUser.currentUser ? (
                  <Home />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            <Route index element={<Navigate replace to="/home" />} />
            <Route
              path="badge"
              element={
                canAccessPage(loggedUser.currentUser, TPages.badge) ? (
                  <Suspense fallback={<Loader />}>
                    <Badge
                      scannedValue={badgeScanner.scanValues.at(-1) ?? ""}
                      clearScannedValue={badgeScanner.clearScanValues}
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
                canAccessPage(loggedUser.currentUser, TPages.chiavi) ? (
                  <Suspense fallback={<Loader />}>
                    <Chiavi
                      scanValues={chiaviScanner.scanValues}
                      addScanValue={chiaviScanner.addScanValue}
                      removeScanValue={chiaviScanner.removeScanValue}
                      clearScanValues={chiaviScanner.clearScanValues}
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
                canAccessPage(loggedUser.currentUser, TPages.veicoli) ? (
                  <Suspense fallback={<Loader />}>
                    <Badge
                      scannedValue={badgeScanner.scanValues.at(-1) ?? ""}
                      clearScannedValue={badgeScanner.clearScanValues}
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
                canAccessPage(loggedUser.currentUser, TPages.archivio) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.protocollo) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.anagrafico) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.register) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.users) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.users) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.assegnazioni) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.postazioni) ? (
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
                canAccessPage(loggedUser.currentUser, TPages.clienti) ? (
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
                loggedUser.currentUser === null ? (
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

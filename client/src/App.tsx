//Modules
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Style
import "bootstrap/dist/css/bootstrap.min.css";

// Types
import { TUser } from "./types";

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

// Utils
import serialPortHandler from "./utils/scannerHandler";
import useSessionStorage from "./hooks/useSessionStorage";
import { Toaster } from "react-hot-toast";

export default function App() {
  // const postazioni = useQuery({
  //   queryKey: ["postazioni"],
  //   queryFn: async () =>
  //     BadgeDataService.getPostazioni().then((response) => {
  //       console.log("queryPostazioni | response:", response);
  //       const result = response.data.data as TPostazione[];
  //       return result;
  //     }),
  // });

  // const [user, setUser] = React.useState<TUser | null>(
  //   SSHandler.getUserFromStorage()
  // );
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
    // SSHandler.setSessionStorage(user);
    // if (
    //   user.admin === true &&
    //   Array.isArray(postazioni.data) &&
    //   postazioni.data[0]
    // )
    //   SSHandler.setPostazione(postazioni.data[0].name);
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
      <AccessiNavbar user={user} logout={logout} />
      <Routes>
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="home"
          element={
            user ? (
              <Home
                user={user}
                scannedValue={timbraVal}
                clearScannedValue={() => setTimbraVal("")}
                scannerConnected={accessiScanner !== undefined}
                runScanner={runAccessiScanner}
                tipoBadge={"BADGE"}
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
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="veicoli"
          element={
            user ? (
              <Home
                user={user}
                scannedValue={timbraVal}
                clearScannedValue={() => setTimbraVal("")}
                scannerConnected={accessiScanner !== undefined}
                runScanner={runAccessiScanner}
                tipoBadge={"VEICOLO"}
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
            user ? <Permessi user={user} /> : <Navigate replace to="/login" />
          }
        />
        <Route
          path="documenti"
          element={
            user ? (
              <Documenti admin={user.admin} />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="admin/*"
          element={
            user && user.admin === true ? (
              <AdminMenu user={user} />
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

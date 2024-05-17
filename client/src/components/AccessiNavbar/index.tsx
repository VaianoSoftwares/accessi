import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import "./index.css";
import UserDataService from "../../services/user";
import PostazioniDataService from "../../services/postazioni";
import ClientiDataService from "../../services/clienti";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { PAGES_INFO, ADMIN_PAGES_INFO, TPages } from "../../types/pages";
import {
  TPermessi,
  canAccessPage,
  getPagesNum,
  hasPerm,
  isAdmin,
} from "../../types/users";
import { Postazione } from "../../types/badges";
import { CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";

export default function AccessiNavbar({
  currPostazione,
  setCurrPostazione,
  badgeScannerConnected,
  runBadgeScanner,
  chiaviScannerConnected,
  runChiaviScanner,
  ...props
}: {
  currPostazione: Postazione | undefined;
  setCurrPostazione: Dispatch<SetStateAction<Postazione | undefined>>;
  badgeScannerConnected: boolean;
  runBadgeScanner: () => Promise<void>;
  chiaviScannerConnected: boolean;
  runChiaviScanner: () => Promise<void>;
}) {
  let location = useLocation().pathname;

  const { currentUser, removeCurrentUser } = useContext(CurrentUserContext)!;

  const { handleError } = useError();

  const [currCliente, setCurrCliente] = useState<string>();

  const postazioni = useQuery({
    queryKey: ["postazioni" /*currentUser?.postazioni*/],
    queryFn: async (context) => {
      try {
        const response = await PostazioniDataService.get({
          ids: currentUser?.postazioni,
        });
        // const response = await PostazioniDataService.get({
        //   ids: context.queryKey[1] as number[],
        // });
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryPostazioni | response:", response);

        const result = response.data.result;
        !currPostazione &&
          setCurrPostazione(result.length === 1 ? result[0] : undefined);
        return result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: async () => {
      try {
        const response = await ClientiDataService.getAll();
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryClienti | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  async function logout() {
    try {
      removeCurrentUser();
      await UserDataService.logout();
    } catch (e) {
      handleError(e);
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link to="#" className="navbar-brand">
          <img
            className="navbar-img-brand"
            src="/logo.png"
            alt="Vero Open"
          ></img>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse flex-column" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100 my-1">
            {getPagesNum(currentUser) > 1 && (
              <li className="nav-item" key="home">
                <Link
                  to="/home"
                  className={`nav-link ${location === "/home" && "active"}`}
                >
                  Home
                </Link>
              </li>
            )}
            {Array.from(PAGES_INFO.entries())
              .filter(([page]) => canAccessPage(currentUser, page))
              .map(([page, pageInfo]) => (
                <li className="nav-item" key={page}>
                  <Link
                    to={pageInfo.pathname}
                    className={`nav-link ${
                      pageInfo.pathname === location && "active"
                    }`}
                  >
                    {pageInfo.name}
                  </Link>
                </li>
              ))}
            {isAdmin(currentUser) && (
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Admin
                </Link>
                <ul className="dropdown-menu">
                  {Array.from(ADMIN_PAGES_INFO.entries()).map(
                    ([page, pageInfo]) => (
                      <li key={page}>
                        <Link to={pageInfo.pathname} className="dropdown-item">
                          {pageInfo.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </li>
            )}
            {hasPerm(currentUser, TPermessi.canLogout) && (
              <li className="nav-item">
                <Link
                  to="#"
                  onClick={async () => await logout()}
                  className="nav-link"
                >
                  Logout {currentUser?.name}
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100 m-1 secondary-nav">
            {clienti.isSuccess && (
              <div className="d-flex">
                <select
                  className="form-select me-2"
                  id="currCliente"
                  name="currCliente"
                  onChange={(event) => {
                    setCurrCliente(event.target.value || undefined);
                    // setCurrPostazione(undefined);
                  }}
                >
                  {isAdmin(currentUser) && (
                    <option label="Tutti i clienti" value={undefined} />
                  )}
                  {clienti.data
                    .filter((cliente) => currentUser?.clienti.includes(cliente))
                    .map((cliente) => (
                      <option value={cliente} key={cliente}>
                        {cliente}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {postazioni.isSuccess && (
              <div className="d-flex">
                <select
                  className="form-select me-2"
                  id="currPostazione"
                  name="currPostazione"
                  onChange={(event) => {
                    const { selectedIndex } = event.target.options;
                    const { id, cliente, name } =
                      event.target.options[selectedIndex].dataset;

                    if (!id || !cliente || !name) setCurrPostazione(undefined);
                    else
                      setCurrPostazione({
                        id: Number.parseInt(id),
                        cliente: cliente!,
                        name: name!,
                      } satisfies Postazione);
                  }}
                >
                  {postazioni.data.length > 1 && (
                    <option>Tutte le postazioni</option>
                  )}
                  {postazioni.data
                    .filter(
                      ({ cliente }) => !currCliente || cliente === currCliente
                    )
                    .map(({ id, cliente, name }) => (
                      <option
                        value={id}
                        data-id={id}
                        data-cliente={cliente}
                        data-name={name}
                        key={id}
                      >
                        {cliente} - {name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {canAccessPage(currentUser, TPages.badge) && (
              <div className="d-flex mx-1">
                <button
                  className="btn btn-light mx-1 scan-btn"
                  onClick={async () => await runBadgeScanner()}
                  type="button"
                >
                  Badge Scanner
                </button>{" "}
                <b
                  className="navbar-text scan-status-txt"
                  style={
                    badgeScannerConnected
                      ? { color: "green" }
                      : { color: "red" }
                  }
                >
                  {!badgeScannerConnected && "Non "}
                  {"Connesso"}
                </b>
              </div>
            )}
            {canAccessPage(currentUser, TPages.chiavi) && (
              <div className="d-flex">
                <button
                  className="btn btn-light mx-1 scan-btn"
                  onClick={async () => await runChiaviScanner()}
                  type="button"
                >
                  Chiavi Scanner
                </button>{" "}
                <b
                  className="navbar-text scan-status-txt"
                  style={
                    chiaviScannerConnected
                      ? { color: "green" }
                      : { color: "red" }
                  }
                >
                  {!chiaviScannerConnected && "Non "}
                  {"Connesso"}
                </b>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

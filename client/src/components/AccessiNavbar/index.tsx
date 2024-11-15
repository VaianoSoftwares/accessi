import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import "./index.css";
import UserDataService from "../../services/user";
import PostazioniDataService from "../../services/postazioni";
import ClientiDataService from "../../services/clienti";
import { useContext } from "react";
import { PAGES_INFO, ADMIN_PAGES_INFO, TPages } from "../../types/pages";
import {
  TPermessi,
  canAccessPage,
  getPagesNum,
  hasPerm,
} from "../../types/users";
import { CurrPostazioneContext, CurrentUserContext } from "../RootProvider";
import useError from "../../hooks/useError";
import { Postazione } from "../../types/postazioni";

const green_check_path = "/green-checkmark-icon.svg";
const red_x_path = "/red-x-icon.svg";

export default function AccessiNavbar({
  badgeScannerConnected,
  runBadgeScanner,
  chiaviScannerConnected,
  runChiaviScanner,
  ...props
}: {
  badgeScannerConnected: boolean;
  runBadgeScanner: () => Promise<void>;
  chiaviScannerConnected: boolean;
  runChiaviScanner: () => Promise<void>;
}) {
  let location = useLocation().pathname;

  const { currentUser, removeCurrentUser } = useContext(CurrentUserContext)!;
  const {
    currCliente,
    setCurrCliente,
    currPostazione,
    setCurrPostazione,
    clearCurrPostazione,
  } = useContext(CurrPostazioneContext)!;

  const { handleError } = useError();

  const postazioni = useQuery({
    queryKey: ["postazioni" /*currentUser?.postazioni*/],
    queryFn: async (context) => {
      try {
        const response = await PostazioniDataService.get({
          ids: currentUser?.postazioni_ids,
        });
        // const response = await PostazioniDataService.get({
        //   ids: context.queryKey[1] as number[],
        // });
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryPostazioni | response:", response);

        const result = response.data.result;

        if (currPostazione === undefined && result.length === 1)
          setCurrPostazione(result[0]);

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

  function adminPagesDropdownMenu() {
    const pagesInfo = Array.from(ADMIN_PAGES_INFO.entries()).filter(([page]) =>
      canAccessPage(currentUser, page)
    );
    return pagesInfo.length > 0 ? (
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
          {Array.from(ADMIN_PAGES_INFO.entries()).map(([page, pageInfo]) => (
            <li key={page}>
              <Link to={pageInfo.pathname} className="dropdown-item">
                {pageInfo.title}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    ) : (
      <></>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid no-user-select">
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
            {adminPagesDropdownMenu()}
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
                  onChange={(event) =>
                    setCurrCliente(event.target.value || undefined)
                  }
                  value={currCliente}
                >
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

                    if (!id || !cliente || !name) clearCurrPostazione();
                    else
                      setCurrPostazione({
                        id: Number.parseInt(id),
                        cliente: cliente!,
                        name: name!,
                      } satisfies Postazione);
                  }}
                  value={currPostazione?.id || 0}
                >
                  {postazioni.data.length > 1 && (
                    <option value={0} key={0}>
                      Tutte le postazioni
                    </option>
                  )}
                  {postazioni.data
                    .filter(({ cliente }) => cliente === currCliente)
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
                  className="scanner-btn btn btn-light mx-1 scan-btn"
                  onClick={async () => await runBadgeScanner()}
                  type="button"
                >
                  <p>Badge Scanner</p>
                  <img
                    src={badgeScannerConnected ? green_check_path : red_x_path}
                  />
                </button>
              </div>
            )}
            {canAccessPage(currentUser, TPages.chiavi) && (
              <div className="d-flex">
                <button
                  className="scanner-btn btn btn-light mx-1 scan-btn"
                  onClick={async () => await runChiaviScanner()}
                  type="button"
                >
                  <p className="scanner-btn-txt">Chiavi Scanner</p>
                  <img
                    className="scanner-icon"
                    src={chiaviScannerConnected ? green_check_path : red_x_path}
                  />
                </button>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

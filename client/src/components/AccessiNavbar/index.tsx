import { useNavigate, useLocation } from "react-router-dom";
import { TUser } from "../../types";
import "./index.css";

export default function AccessiNavbar(props: {
  user: TUser | null;
  logout: () => Promise<void>;
}) {
  const navigate = useNavigate();
  let location = useLocation().pathname;

  const logout = async () => {
    await props.logout();
    navigate("/login");
  };

  return (
    props.user && (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="navbar-brand">
          <b className="b-navbar-brand">
            {location === "/home" && "Gestione Badge"}
            {location === "/chiavi" && "Gestione Chiavi"}
            {location === "/veicoli" && "Gestione Veicoli"}
            {location === "/archivio" && "Archivio"}
            {location === "/calendario" && "Calendario"}
            {location === "/permessi" && "Permessi"}
            {location === "/documenti" && "Documenti"}
            {location.includes("/admin") && "Admin Menu"}
          </b>
        </div>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <button onClick={() => navigate("/home")} className="btn-nav">
              Badge
            </button>
          </li>
          {(props.user.admin === true ||
            props.user.postazioni!.indexOf("Sala-Controllo") >= 0) && (
            <li className="nav-item">
              <button onClick={() => navigate("/chiavi")} className="btn-nav">
                Chiavi
              </button>
            </li>
          )}
          {props.user.admin === true && (
            <>
              <li className="nav-item">
                <button
                  onClick={() => navigate("/veicoli")}
                  className="btn-nav"
                >
                  Veicoli
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => navigate("/archivio")}
                  className="btn-nav"
                >
                  Archivio
                </button>
              </li>
            </>
          )}
          <li className="nav-item">
            <button onClick={() => navigate("/calendario")} className="btn-nav">
              Calendario
            </button>
          </li>
          {props.user.admin === true && (
            <>
              <li className="nav-item">
                <button
                  onClick={() => navigate("/permessi")}
                  className="btn-nav"
                >
                  Permessi
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => navigate("/documenti")}
                  className="btn-nav"
                >
                  Documenti
                </button>
              </li>
              <li className="nav-item">
                <button onClick={() => navigate("/admin")} className="btn-nav">
                  Opzioni
                </button>
              </li>
              <li className="nav-item">
                <button onClick={() => logout()} className="btn-nav">
                  Logout {props.user.username}
                </button>
              </li>
            </>
          )}
        </div>
      </nav>
    )
  );
}

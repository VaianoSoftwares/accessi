import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Nullable } from "../../types/Nullable";
import { TUser } from "../../types/TUser";
import "./index.css";

type Props = {
  user: Nullable<TUser>;
  logout: () => Promise<void>;
};

const AccessiNavbar: React.FC<Props> = (props: Props) => {

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
          <li className="nav-item">
            <button onClick={() => navigate("/calendario")} className="btn-nav">
              Calendario
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => navigate("/permessi")} className="btn-nav">
              Permessi
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => navigate("/documenti")} className="btn-nav">
              Documenti
            </button>
          </li>
          {props.user.admin === true && (
            <li className="nav-item">
              <button onClick={() => navigate("/admin")} className="btn-nav">
                Opzioni
              </button>
            </li>
          )}
          <li className="nav-item">
            <button onClick={() => logout()} className="btn-nav">
              Logout {props.user.name}
            </button>
          </li>
        </div>
      </nav>
    )
  );
}

export default AccessiNavbar;
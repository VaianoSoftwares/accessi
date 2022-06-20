/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Nullable } from "../../types/Nullable";
// import { TipoBadge } from "../enums/TipoBadge";
// import { BadgeFormState } from "../types/BadgeFormState";
import { User } from "../../types/User";
import "./index.css";

type Props = {
  user: Nullable<User>;
  logout: () => Promise<void>;
  // badgeForm: BadgeFormState;
  // setBadgeForm: React.Dispatch<React.SetStateAction<BadgeFormState>>;
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
            {location.includes("/admin") && "Admin Menu"}
          </b>
        </div>
        <div className="navbar-nav mr-auto">
          {/* {location === "/home" && (
            <>
              <li className="nav-item">
                <button
                  onClick={() =>
                    props.setBadgeForm({
                      ...props.badgeForm,
                      tipo: TipoBadge.BADGE,
                    })
                  }
                  className="btn btn-primary"
                >
                  Badge
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() =>
                    props.setBadgeForm({
                      ...props.badgeForm,
                      tipo: TipoBadge.CHIAVE,
                    })
                  }
                  className="btn btn-primary"
                >
                  Chiave
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() =>
                    props.setBadgeForm({
                      ...props.badgeForm,
                      tipo: TipoBadge.VEICOLO,
                    })
                  }
                  className="btn btn-primary"
                >
                  Veicolo
                </button>
              </li>
            </>
          )} */}
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
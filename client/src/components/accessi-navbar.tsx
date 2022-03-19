/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { TipoBadge } from "../enums/TipoBadge";
import { BadgeFormState } from "../types/BadgeFormState";
import { User } from "../types/User";

type Props = {
  user: User;
  logout: () => Promise<void>;
  badgeForm: BadgeFormState;
  setBadgeForm: React.Dispatch<React.SetStateAction<BadgeFormState>>;
};

const AccessiNavbar: React.FC<Props> = (props: Props) => {

  const navigate = useNavigate();

  const logout = async () => {
    await props.logout();
    navigate("../login");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="navbar-brand">
        <b>
          Gestione{" "}
          {`${props.badgeForm.tipo[0].toUpperCase()}${props.badgeForm.tipo.slice(1)}`}
        </b>
      </div>
      <div className="navbar-nav mr-auto">
        <li className="nav-item">
          <button onClick={() => props.setBadgeForm({ ...props.badgeForm, tipo: TipoBadge.BADGE })} className="btn btn-primary">
            Badge
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => props.setBadgeForm({ ...props.badgeForm, tipo: TipoBadge.CHIAVE })} className="btn btn-primary">
            Chiave
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => props.setBadgeForm({ ...props.badgeForm, tipo: TipoBadge.VEICOLO })} className="btn btn-primary">
            Veicolo
          </button>
        </li>
        {props.user.admin === true && (
          <li className="nav-item">
            <Link to="../admin" className="nav-link">
              Opzioni
            </Link>
          </li>
        )}
        <li className="nav-item">
          <button onClick={() => logout()} className="btn btn-primary">
            Logout {props.user.name}
          </button>
        </li>
      </div>
    </nav>
  );
}

export default AccessiNavbar;
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { TipoBadge } from "../enums/TipoBadge";
import { User } from "../types/User";

type Props = {
  user: User;
  logout: () => Promise<void>;
  tipoBadge: TipoBadge;
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
          {`${props.tipoBadge[0].toUpperCase()}${props.tipoBadge.slice(1)}`}
        </b>
      </div>
      <div className="navbar-nav mr-auto">
        <li className="nav-item">
          <Link to="." className="nav-link">
            Homepage
          </Link>
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
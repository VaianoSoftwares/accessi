/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";

const AccessiNavbar = props => {
  const logout = () => {
    props.logout();
    props.history.push("/login");
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
          <Link to={"/home"} className="nav-link">
            Homepage
          </Link>
        </li>
        <li className="nav-item">
          <Link to={"/register"} className="nav-link">
            Opzioni
          </Link>
        </li>
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
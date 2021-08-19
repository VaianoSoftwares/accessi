/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";

const AccessiNavbar = props => {
  const logout = () => {
    props.logout();
    props.history.push("/login");
  }

  return (
    <nav className="navbar navbar-expand navbar-dark bg-primary">
        <Link to={"/home"} className="navbar-brand">
          <h3>Gestione Accessi</h3>
        </Link>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={"/home"} className="nav-link">
              Homepage
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/register"} className="nav-link">
              Registra nuovo account
            </Link>
          </li>
          <li className="nav-item">
            <a href="" onClick={() => logout} className="nav-link" style={{cursor:"pointer"}}>
                Logout {props.user.name}
            </a>
          </li>
        </div> 
      </nav>
  );
}

export default AccessiNavbar;
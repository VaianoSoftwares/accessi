// modules
import { Routes, Route, Link, Navigate } from "react-router-dom";
// components
import Assegnazioni from "../Assegnazioni";
import Register from "../register";
import Postazioni from "../Postazioni";
// style
import "./index.css";
// types
import { TUser } from "../../types";

export default function AdminMenu(props: { user: TUser }) {
  return (
    <div className="row admin-menu-wrapper">
      <div className="col-sm-1 m-3">
        <div className="btn-group-vertical">
          <button className="btn btn-success btn-block">
            <Link className="link-white-text" to="register">
              Registra Account
            </Link>
          </button>
          <button className="btn btn-success btn-block">
            <Link className="link-white-text" to="assegnaz">
              Modifica Assegnaz
            </Link>
          </button>
          <button className="btn btn-success btn-block">
            <Link className="link-white-text" to="postazioni">
              Modifica Postazioni
            </Link>
          </button>
          <button className="btn btn-success btn-block">
            <Link className="link-white-text" to="../../home">
              Torna ad Home
            </Link>
          </button>
        </div>
      </div>
      <div className="col m-3">
        <Routes>
          <Route
            path="register"
            element={
              props.user && props.user.admin === true ? (
                <Register />
              ) : props.user ? (
                <Navigate replace to="../../home" />
              ) : (
                <Navigate replace to="../../login" />
              )
            }
          />
          <Route path="/" element={<Navigate replace to="register" />} />
          <Route
            path="assegnaz"
            element={
              props.user && props.user.admin === true ? (
                <Assegnazioni />
              ) : props.user ? (
                <Navigate replace to="../../home" />
              ) : (
                <Navigate replace to="../../login" />
              )
            }
          />
          <Route
            path="postazioni"
            element={
              props.user && props.user.admin === true ? (
                <Postazioni />
              ) : props.user ? (
                <Navigate replace to="../../home" />
              ) : (
                <Navigate replace to="../../login" />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

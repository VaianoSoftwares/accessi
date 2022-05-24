// modules
import React from "react";
import {
    Routes,
    Route,
    Link,
    Navigate,
} from "react-router-dom";
// components
import Assegnaz from "../Assegnaz";
import Register from "../register";
// style
import "./index.css";
// types
import { User } from "../../types/User";
import { TAlert } from "../../types/TAlert";
import { Nullable } from "../../types/Nullable";
import { TipoBadge } from "../../enums/TipoBadge";
import { Assegnazione } from "../../types/Assegnazione";

type Props = {
    user: User;
    logout: () => Promise<void>;
    alert: Nullable<TAlert>;
    setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
    tipiBadge: TipoBadge[];
    assegnazioni: Assegnazione[];
    setAssegnazioni: React.Dispatch<React.SetStateAction<Assegnazione[]>>;
};

const AdminMenu: React.FC<Props> = (props: Props) => {

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
                        element={props.user && props.user.admin === true ? (
                            <Register
                                alert={props.alert}
                                setAlert={props.setAlert}
                            />
                        ) : props.user ? (
                            <Navigate replace to="../../home" />
                        ) : (
                            <Navigate replace to="../../login" />
                        )}
                    />
                    <Route path="/" element={<Navigate replace to="register" />} />
                    <Route
                        path="assegnaz"
                        element={props.user && props.user.admin === true ? (
                            <Assegnaz
                                alert={props.alert}
                                setAlert={props.setAlert}
                                tipiBadge={props.tipiBadge}
                                assegnazioni={props.assegnazioni}
                                setAssegnazioni={props.setAssegnazioni}
                            />
                        ) : props.user ? (
                            <Navigate replace to="../../home" />
                        ) : (
                            <Navigate replace to="../../login" />
                        )}
                    />
                </Routes>
            </div>
        </div>
    );
};

export default AdminMenu;
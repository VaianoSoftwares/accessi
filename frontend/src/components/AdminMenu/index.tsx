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
import PageNotFound from "../PageNotFound";
// types
import { User } from "../../types/User";
import { TAlert } from "../../types/TAlert";
import { Nullable } from "../../types/Nullable";

type Props = {
    user: User;
    logout: () => Promise<void>;
    token: string;
    alert: Nullable<TAlert>;
    setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
};

const AdminMenu: React.FC<Props> = (props: Props) => {

    return (
        <div className="row">
            <div className="col-sm-1 mb-1">
                <div className="row">
                    <button className="btn btn-success">
                        <Link to="register">
                            Registra Account
                        </Link>
                    </button>
                </div>
                <div className="row">
                    <button className="btn btn-success">
                        <Link to="assegnaz">
                            Modifica Assegnaz
                        </Link>
                    </button>
                </div>
                <div className="row">
                    <button className="btn btn-success">
                        <Link to="../home">
                            Torna ad Home
                        </Link>
                    </button>
                </div>
            </div>
            <div className="col">
                <Routes>
                    <Route path="*" element={<PageNotFound />} />
                    <Route
                        path="register"
                        element={props.user && props.user.admin === true ? (
                            <Register
                                user={props.user}
                                logout={props.logout}
                                token={props.token}
                                alert={props.alert}
                                setAlert={props.setAlert}
                            />
                        ) : props.user ? (
                            <Navigate replace to="../home" />
                        ) : (
                            <Navigate replace to="../login" />
                        )}
                    />
                    <Route path="/" element={<Navigate replace to="register" />} />
                    <Route
                        path="assegnaz"
                        element={props.user && props.user.admin === true ? (
                            <Assegnaz
                                user={props.user}
                                logout={props.logout}
                                token={props.token}
                                alert={props.alert}
                                setAlert={props.setAlert}
                            />
                        ) : props.user ? (
                            <Navigate replace to="../home" />
                        ) : (
                            <Navigate replace to="../login" />
                        )}
                    />
                    <Route element={<h1>page not found</h1>} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminMenu;
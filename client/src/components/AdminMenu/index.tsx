// modules
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
import { TUser } from "../../types/TUser";
import { TAlert } from "../../types/TAlert";
import { TPostazione } from "../../types/TPostazione";
import { TAssegnazione } from "../../types/TAssegnazione";

type Props = {
    user: TUser;
    logout: () => Promise<void>;
    alert: TAlert | null;
    openAlert: (alert: TAlert) => void;
    closeAlert: () => void;
    assegnazioni: TAssegnazione[];
    addAssegnazione: (assegnazione: TAssegnazione) => void;
    removeAssegnazione: (name: string) => void;
    clienti: string[];
    postazioni: TPostazione[];
};

export default function AdminMenu(props: Props) {

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
                                openAlert={props.openAlert}
                                closeAlert={props.closeAlert}
                                clienti={props.clienti}
                                postazioni={props.postazioni}
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
                                openAlert={props.openAlert}
                                closeAlert={props.closeAlert}
                                assegnazioni={props.assegnazioni}
                                addAssegnazione={props.addAssegnazione}
                                removeAssegnazione={props.removeAssegnazione}
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
}
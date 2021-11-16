// modules
import React from "react";
import {
    Switch,
    Route,
    Link,
    Redirect,
    BrowserRouter as Router,
    RouteComponentProps,
} from "react-router-dom";
// components
import Assegnaz from "../assegnaz/assegnaz";
import Register from "../register.jsx";
// types
import { User } from "../../types/User";
import { TAlert } from "../../types/TAlert";
import { Nullable } from "../../types/Nullable";

interface Props extends RouteComponentProps<any> {
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
                        <Link to="/admin/register">
                            Registra Account
                        </Link>
                    </button>
                </div>
                <div className="row">
                    <button className="btn btn-success">
                        <Link to="/admin/assegnaz">
                            Modifica Assegnaz
                        </Link>
                    </button>
                </div>
                <div className="row">
                    <button className="btn btn-success">
                        <Link to="/home">
                            Torna ad Home
                        </Link>
                    </button>
                </div>
            </div>
            <div className="col">
                <Router>
                    <Switch>
                        <Route
                            exact path={["/admin/", "/admin/register"]}
                            render={() => props.user && props.user.admin === true ? (
                                <Register
                                    {...props}
                                    user={props.user}
                                    logout={props.logout}
                                    token={props.token}
                                    alert={props.alert}
                                    setAlert={props.setAlert}
                                />
                            ) : props.user ? (
                                <Redirect to="/home" />
                            ) : (
                                <Redirect to="/login" />
                            )}
                        />
                        <Route
                            path="/admin/assegnaz"
                            render={() => props.user && props.user.admin === true ? (
                                <Assegnaz
                                    {...props}
                                    user={props.user}
                                    logout={props.logout}
                                    token={props.token}
                                    alert={props.alert}
                                    setAlert={props.setAlert}
                                />
                            ) : props.user ? (
                                <Redirect to="/home" />
                            ) : (
                                <Redirect to="/login" />
                            )}
                        />
                    </Switch>
                </Router>
            </div>
        </div>
    );
};

export default AdminMenu;
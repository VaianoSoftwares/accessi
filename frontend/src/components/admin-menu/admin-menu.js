import React from "react";
import {
    Switch,
    Route,
    Link,
    Redirect,
    BrowserRouter as Router,
} from "react-router-dom";

import Assegnaz from "../assegnaz/assegnaz";
import Register from "../register.js";

const AdminMenu = props => {

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
                                    setAlert={props.setAlert}
                                />
                            ) : props.user ? (
                                <Redirect to="/home" />
                            ) : (
                                <Redirect to="/login" />
                            )}
                        />
                        <Route
                            exact path="/admin/assegnaz"
                            render={() => props.user && props.user.admin === true ? (
                                <Assegnaz
                                    {...props}
                                    user={props.user}
                                    logout={props.logout}
                                    token={props.token}
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
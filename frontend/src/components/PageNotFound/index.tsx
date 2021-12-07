import React from "react";
import { Link } from "react-router-dom";
import "./index.css";

const PageNotFound: React.FC<{}> = () => {
    return (
        <div>
            <h1 className="centered-text">404 - Page not found</h1>
            <Link to="../../../home">
                <p className="centered-text">Torna in Home</p>
            </Link>
        </div>
    );
};

export default PageNotFound;
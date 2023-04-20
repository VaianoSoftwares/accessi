import { Link } from "react-router-dom";
import "./index.css";

export default function PageNotFound() {
  return (
    <div>
      <h1 className="centered-text">404 - Page not found</h1>
      <Link to="../../../home">
        <p className="centered-text">Torna in Home</p>
      </Link>
    </div>
  );
}

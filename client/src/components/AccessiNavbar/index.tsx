import { useNavigate, useLocation, Link } from "react-router-dom";
import { TUser, PAGES_INFO, ADMIN_PAGES_INFO } from "../../types";
import capitalize from "../../utils/capitalize";
import "./index.css";

function trimLocation(pathname: string) {
  const capitalized = capitalize(pathname.slice(1));
  const endString = capitalized.indexOf("/");
  return endString === -1 ? capitalized : capitalized.slice(0, endString);
}

export default function AccessiNavbar({
  user,
  ...props
}: {
  user: TUser;
  logout: () => Promise<void>;
}) {
  const navigate = useNavigate();
  let location = useLocation().pathname;

  async function logout() {
    await props.logout();
    navigate("/login");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <Link to="/home" className="navbar-brand">
        <b className="b-navbar-brand">{trimLocation(location)}</b>
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav mr-auto">
          {(user.admin || (user.pages && user.pages.length > 1)) && (
            <li className="nav-item" key="home">
              <Link to="/home" className="nav-link">
                Home
              </Link>
            </li>
          )}
          {Array.from(PAGES_INFO.entries())
            .filter(([page]) => user.admin || user.pages!.indexOf(page) >= 0)
            .map(([page, pageInfo]) => (
              <li className="nav-item" key={page}>
                <Link to={pageInfo.pathname} className="nav-link">
                  {pageInfo.name}
                </Link>
              </li>
            ))}
          {user.admin && (
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Admin
              </Link>
              <ul className="dropdown-menu">
                {Array.from(ADMIN_PAGES_INFO.entries()).map(
                  ([page, pageInfo]) => (
                    <li key={page}>
                      <Link to={pageInfo.pathname} className="dropdown-item">
                        {pageInfo.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </li>
          )}
          {user.canLogout && (
            <li className="nav-item">
              <Link to="#" onClick={() => logout()} className="nav-link">
                Logout {user.username}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

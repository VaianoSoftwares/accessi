import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import {
  TGenericPage,
  IPageInfo,
  PAGES_INFO,
  ADMIN_PAGES_INFO,
} from "../../types/pages";
import {
  TLoggedUser,
  canAccessPage,
  getFirstPage,
  getPagesNum,
  isAdmin,
} from "../../types/users";

export default function Home({ user }: { user: TLoggedUser }) {
  const navigate = useNavigate();

  function homeCard([page, pageInfo]: [TGenericPage, IPageInfo]) {
    return (
      <div className="col-sm-3 mt-1" key={page}>
        <div
          className="card home-card"
          onClick={() => navigate(pageInfo.pathname)}
        >
          <div className="row g-0">
            <div className="col-sm-4">
              <img
                src={pageInfo.imagePath}
                className="img-fluid rounder-start home-card-img"
                alt=""
              ></img>
            </div>
            <div className="col-sm">
              <div className="card-body">
                <h5 className="card-title">{pageInfo.title}</h5>
                <p className="card-text">{pageInfo.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (getPagesNum(user) === 1)
      navigate(PAGES_INFO.get(getFirstPage(user))!.pathname);
  }, [user]);

  return (
    <div className="home-wrapper">
      <div className="row mx-1">
        {Array.from(PAGES_INFO.entries())
          .filter(([page]) => canAccessPage(user, page))
          .map((page) => homeCard(page))}
        {isAdmin(user) &&
          Array.from(ADMIN_PAGES_INFO.entries()).map((page) => homeCard(page))}
      </div>
    </div>
  );
}

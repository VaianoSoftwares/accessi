import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import {
  TGenericPage,
  IPageInfo,
  PAGES_INFO,
  ADMIN_PAGES_INFO,
} from "../../types/pages";
import {
  canAccessPage,
  getFirstPage,
  getPagesNum,
  isAdmin,
} from "../../types/users";
import { CurrentUserContext } from "../RootProvider";

export default function Home() {
  const navigate = useNavigate();

  const { currentUser } = useContext(CurrentUserContext)!;

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
    if (getPagesNum(currentUser) === 1)
      navigate(PAGES_INFO.get(getFirstPage(currentUser!))!.pathname);
  }, [currentUser]);

  return (
    <div className="home-wrapper">
      <div className="row mx-1">
        {Array.from(PAGES_INFO.entries())
          .filter(([page]) => canAccessPage(currentUser!, page))
          .map((page) => homeCard(page))}
        {Array.from(ADMIN_PAGES_INFO.entries())
          .filter(([page]) => canAccessPage(currentUser!, page))
          .map((page) => homeCard(page))}
      </div>
    </div>
  );
}

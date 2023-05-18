import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_PAGES_INFO,
  IPageInfo,
  PAGES_INFO,
  TGenericPage,
  TUser,
} from "../../types";
import "./index.css";

export default function Home({ user }: { user: TUser }) {
  const navigate = useNavigate();

  function homeCard([page, pageInfo]: [TGenericPage, IPageInfo]) {
    return (
      <div className="col-sm-3 mt-1" key={page}>
        <div
          className="card home-card"
          onClick={() => navigate(pageInfo.pathname)}
        >
          <div className="card-body">
            <h5 className="card-title">{pageInfo.title}</h5>
            <p className="card-text">{pageInfo.description}</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (user.pages?.length === 1) navigate(`/${user.pages[0]}`);
  }, [user]);

  return (
    <div className="row m-1">
      {Array.from(PAGES_INFO.entries())
        .filter(([page]) => user.admin || user.pages?.includes(page))
        .map((page) => homeCard(page))}
      {user.admin &&
        Array.from(ADMIN_PAGES_INFO.entries()).map((page) => homeCard(page))}
    </div>
  );
}

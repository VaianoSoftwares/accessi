import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import UserDataService from "../../services/user";
import "./index.css";

export default function UsersList() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await UserDataService.getAllUsers();
      console.log("usersQuery |", response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      const result = response.data.result;
      return result;
    },
  });

  return (
    <div className="container-fluid">
      <h2>Utenti</h2>
      <div className="list-group users-list col-sm-2">
        {usersQuery.isSuccess &&
          usersQuery.data.map((user) => (
            <Link
              to={`/admin/users/${user.id}`}
              key={user.id}
              className="list-group-item list-group-item-action"
            >
              {user.name}
            </Link>
          ))}
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import UserDataService from "../../services/user";
import { TFullUser } from "../../types";
import "./index.css";

export default function UsersList() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await UserDataService.getAllUsers();
      console.log("usersQuery |", response);
      const result = response.data.data as TFullUser[];
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
              to={`/admin/users/${user._id}`}
              key={user._id}
              className="list-group-item list-group-item-action"
            >
              {user.username}
            </Link>
          ))}
      </div>
    </div>
  );
}

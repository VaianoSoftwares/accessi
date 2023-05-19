import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import UserDataService from "../../services/user";
import BadgeDataService from "../../services/badge";
import { PAGES, TFullUser, TPostazione } from "../../types";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useParams } from "react-router";

export default function UserEdit() {
  const { userId } = useParams();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const deviceRef = useRef<HTMLInputElement>(null);
  const canLogoutRef = useRef<HTMLInputElement>(null);
  const excelRef = useRef<HTMLInputElement>(null);
  const provvisoriRef = useRef<HTMLInputElement>(null);
  const postazioniRef = useRef<HTMLSelectElement>(null);
  const pagesRef = useRef<HTMLSelectElement>(null);

  const postazioni = useQuery({
    queryKey: ["postazioni"],
    queryFn: async () => {
      const response = await BadgeDataService.getPostazioni();
      console.log("getPostazioni | response:", response);
      const result = response.data.data as TPostazione[];
      return result;
    },
  });

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const response = await UserDataService.getUser({ _id: userId! });
      console.log("userQuery | response:", response);
      const result = response.data.data as TFullUser;
      return result;
    },
  });

  const updateUser = useMutation({
    mutationFn: (data: FormData) =>
      UserDataService.updateUser({ _id: userId!, user: data }),
    onSuccess: async (response) => {
      console.log("updateUser | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["users", userId] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "updateUser"),
  });

  const deleteUser = useMutation({
    mutationFn: () => UserDataService.deleteUser({ _id: userId! }),
    onSuccess: async (response) => {
      console.log("deleteUser | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(response.data.msg);
      navigate("/admin/users");
    },
    onError: async (err) => axiosErrHandl(err, "deleteUser"),
  });

  function createFormData() {
    const formData = new FormData();

    usernameRef.current &&
      formData.append("username", usernameRef.current.value);
    passwordRef.current &&
      formData.append("password", passwordRef.current.value);
    deviceRef.current && formData.append("device", deviceRef.current.value);
    canLogoutRef.current &&
      formData.append("canLogout", String(canLogoutRef.current.checked));
    postazioniRef.current &&
      formData.append(
        "postazioni",
        JSON.stringify(
          Array.from(
            postazioniRef.current.selectedOptions,
            (option) => option.value
          )
        )
      );
    pagesRef.current &&
      formData.append(
        "pages",
        JSON.stringify(
          Array.from(pagesRef.current.selectedOptions, (option) => option.value)
        )
      );

    return formData;
  }

  return (
    <div className="user-edit-wrapper submit-form container-fluid">
      {postazioni.isSuccess && userQuery.isSuccess && (
        <>
          <h2>Modifica Account: {userQuery.data.username}</h2>
          <div className="row mb-1">
            <div className="form-group col-sm-3">
              <label htmlFor="username">Username</label>
              <input
                className="form-control form-control-sm"
                type="text"
                id="username"
                ref={usernameRef}
                defaultValue={userQuery.data.username}
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="password">Password</label>
              <input
                className="form-control form-control-sm"
                type="password"
                id="password"
                ref={passwordRef}
                defaultValue={userQuery.data.password}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="form-group col-sm-3">
              <label htmlFor="device">Dispositivo</label>
              <input
                className="form-control form-control-sm"
                type="text"
                id="device"
                ref={deviceRef}
                defaultValue={userQuery.data.device}
                required
                autoComplete="off"
              />
            </div>
          </div>
          <div className="form-check col-sm-2 my-2">
            <label htmlFor="canlogout" className="form-check-label">
              canLogout
            </label>
            <input
              type="checkbox"
              className="form-check-input"
              id="canlogout"
              autoComplete="off"
              ref={canLogoutRef}
              defaultChecked={userQuery.data.canLogout}
            />
          </div>
          <div className="form-check col-sm-2 my-2">
            <label htmlFor="excel" className="form-check-label">
              excel
            </label>
            <input
              type="checkbox"
              className="form-check-input"
              id="excel"
              autoComplete="off"
              ref={excelRef}
              defaultChecked={userQuery.data.excel}
            />
          </div>
          <div className="form-check col-sm-2 my-2">
            <label htmlFor="provvisori" className="form-check-label">
              provvisori
            </label>
            <input
              type="checkbox"
              className="form-check-input"
              id="provvisori"
              autoComplete="off"
              ref={provvisoriRef}
              defaultChecked={userQuery.data.provvisori}
            />
          </div>
          <div className="row mb-1">
            <div className="form-group col-sm-3">
              <label htmlFor="postazioni">Postazioni</label>
              <select
                className="form-control form-control-sm"
                id="postazioni"
                ref={postazioniRef}
                multiple
                required
                value={postazioni.data
                  .map(({ _id }) => _id)
                  .filter((id) => userQuery.data.postazioni?.includes(id))}
              >
                {postazioni.data
                  ?.filter(({ cliente, name }) => cliente && name)
                  .map(({ _id, cliente, name }) => (
                    <option key={_id} value={_id}>
                      {cliente}-{name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group col-sm-3">
              <label htmlFor="pages">Pagine</label>
              <select
                className="form-control form-control-sm"
                id="pages"
                ref={pagesRef}
                multiple
                required
                value={PAGES.filter((page) =>
                  userQuery.data.pages?.includes(page)
                )}
              >
                {PAGES.map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-success mx-1"
            onClick={() => {
              const confirm = window.confirm(
                "Procedere alla modifica dell'utente?"
              );
              if (!confirm) return;
              updateUser.mutate(createFormData());
            }}
          >
            Applica Modifiche
          </button>
          <button
            type="submit"
            className="btn btn-danger mx-1"
            onClick={() => {
              const confirm = window.confirm(
                "Procedere all'eliminazione dell'utente?"
              );
              if (!confirm) return;
              deleteUser.mutate();
            }}
          >
            Elimina Utente
          </button>
          <Link to="..">
            <button type="submit" className="btn btn-secondary mx-1">
              Torna Indietro
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import UserDataService from "../../services/user";
import BadgeDataService from "../../services/badge";
import { toast } from "react-hot-toast";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { PAGES, RegisterFormState, TPostazione } from "../../types";

export default function Register() {
  const postazioni = useQuery({
    queryKey: ["postazioni"],
    queryFn: async () => {
      const response = await BadgeDataService.getPostazioni();
      console.log("queryPostazioni | response:", response);
      const result = response.data.data as TPostazione[];
      return result;
    },
  });

  // const clienti = useQuery({
  //   queryKey: ["clienti"],
  //   queryFn: async () => {
  //     const response = await BadgeDataService.getClienti();
  //     console.log("queryClienti | response:", response);
  //     const result = response.data.data as string[];
  //     return result;
  //   },
  // });

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const postazioniRef = useRef<HTMLSelectElement>(null);
  const pagesRef = useRef<HTMLSelectElement>(null);
  const deviceRef = useRef<HTMLInputElement>(null);
  const canLogoutRef = useRef<HTMLInputElement>(null);
  const excelRef = useRef<HTMLInputElement>(null);
  const provvisoriRef = useRef<HTMLInputElement>(null);

  function formToObj(): RegisterFormState {
    return {
      username: usernameRef.current!.value,
      password: passwordRef.current!.value,
      postazioni: Array.from(
        postazioniRef.current!.selectedOptions,
        (option) => option.value
      ),
      pages: Array.from(
        pagesRef.current!.selectedOptions,
        (option) => option.value
      ),
      device: deviceRef.current!.value,
      canLogout: canLogoutRef.current!.checked,
    };
  }

  function clearForm() {
    usernameRef.current!.value = usernameRef.current!.defaultValue;
    passwordRef.current!.value = passwordRef.current!.defaultValue;
    postazioniRef.current!.selectedIndex = -1;
    pagesRef.current!.selectedIndex = -1;
    deviceRef.current!.value = deviceRef.current!.defaultValue;
    canLogoutRef.current!.checked = canLogoutRef.current!.defaultChecked;
  }

  function register() {
    UserDataService.register(formToObj())
      .then((response) => {
        console.log("register |", response.data);
        toast.success(response.data.msg);
      })
      .catch((err) => axiosErrHandl(err, "register"))
      .finally(() => clearForm());
  }

  return (
    <div className="submit-form container-fluid">
      <h2>Registra Nuovo Account</h2>
      <div className="row mb-1">
        <div className="form-group col-sm-3">
          <label htmlFor="username">Username</label>
          <input
            className="form-control form-control-sm"
            type="text"
            id="username"
            ref={usernameRef}
            defaultValue=""
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
            defaultValue=""
            required
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
            defaultValue=""
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
          defaultChecked={false}
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
          defaultChecked={false}
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
          defaultChecked={false}
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
          >
            {PAGES.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button onClick={() => register()} className="btn btn-success">
        Register
      </button>
    </div>
  );
}

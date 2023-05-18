import React from "react";
import {
  MONTHS,
  N_CALENDAR_COLS,
  N_DATE_DIVS,
  TPermesso,
  TUser,
  W100_POS,
  WithId,
} from "../../types";
import UserDataService from "../../services/user";
import "./index.css";
import dateFormat from "dateformat";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import useDate from "../../hooks/useDate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MAX_PERMESSI = 3;

function getPrevMonthFirstDate(date: Date) {
  const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = (firstDate.getDay() + 6) % 7;
  return new Date(firstDate.setDate(firstDate.getDate() - firstDay));
}

function w100Div(key: React.Key) {
  return <div className="w-100" key={key} />;
}

function notAvailableDateDiv(key: React.Key, date: Date) {
  return (
    <div
      className="col date-div"
      key={key}
      data-not-available
    >{`${date.getDate()}`}</div>
  );
}

function prenotatoDateDiv(key: React.Key, date: Date) {
  return (
    <div className="col date-div" key={key} data-prenotato>
      <p>{`${date.getDate()}`}</p>
      <p>Prenotato</p>
    </div>
  );
}

export default function Permessi({ user }: { user: TUser }) {
  const queryClient = useQueryClient();

  const [currDate, { incrDate, decrDate }] = useDate();

  const queryPermessi = useQuery({
    queryKey: ["permessi", { date: dateFormat(currDate, "dd-mm-yyyy") }],
    queryFn: async (context) => {
      const { date } = context.queryKey[1] as Partial<TPermesso>;
      const response = await UserDataService.getPermessi({ date });
      console.log("queryPermessi | response:", response);
      const result = response.data.data as WithId<TPermesso>[];
      return result;
    },
  });

  const addPermesso = useMutation({
    mutationFn: (data: TPermesso) => UserDataService.postPermesso(data),
    onSuccess: async (response) => {
      console.log("addPermesso | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["permessi"] });
    },
    onError: async (err) => axiosErrHandl(err, "addPermesso"),
  });

  const deletePermesso = useMutation({
    mutationFn: (data: string) => UserDataService.deletePermesso(data),
    onSuccess: async (response) => {
      console.log("deletePermesso | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["permessi"] });
    },
    onError: async (err) => axiosErrHandl(err, "deletePermesso"),
  });

  function availableDateDiv(key: React.Key, date: Date, disp: number) {
    return (
      <div className="col date-div" key={key}>
        <p>{`${date.getDate()}`}</p>
        <p>Disponibilità:{` ${disp}`}</p>
        <input
          type="checkbox"
          value={dateFormat(date, "dd-mm-yyyy")}
          onChange={checkboxEventHandl}
        />
      </div>
    );
  }

  function adminDateDiv(key: React.Key, date: Date) {
    const prenotati = getPrenotazioniByDate(date);

    return (
      <div className="col date-div" key={key}>
        <p>{`${date.getDate()}`}</p>
        <p>Disponibilità:{` ${MAX_PERMESSI - prenotati.length}`}</p>
        {prenotati.map(({ _id, username }, i) => (
          <>
            <span key={i + 1000}>{`${username} `}</span>
            <input
              type="checkbox"
              value={_id}
              onChange={checkBoxAdminEventHandl}
              key={i}
              checked
            />
          </>
        ))}
      </div>
    );
  }

  function checkboxEventHandl(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: date } = e.target;
    const tmpPerm: TPermesso = { username: user.username, date };
    addPermesso.mutate(tmpPerm);
  }

  function checkBoxAdminEventHandl(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: _id } = e.target;
    deletePermesso.mutate(_id);
  }

  function getPrenotazioniByDate(date: Date | string) {
    date = dateFormat(date, "dd-mm-yyyy");
    return queryPermessi!.data!.filter((p) => p.date === date);
  }

  function getPermNum(date: Date | string) {
    date = dateFormat(date, "dd-mm-yyyy");
    return (
      MAX_PERMESSI - queryPermessi!.data!.filter((p) => p.date === date).length
    );
  }

  function isPrenotato(permesso: TPermesso) {
    return queryPermessi!.data!.find(
      (p) => p.date === permesso.date && p.username === permesso.username
    );
  }

  function createCalendar(date: Date) {
    console.log("creatCalendar |", date, queryPermessi.data);

    const now = new Date();
    const currMonth = date.getMonth();

    let tmpDate = getPrevMonthFirstDate(date);
    tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() - 1));

    return [...Array(N_DATE_DIVS)].map((_, i) => {
      if (i % N_CALENDAR_COLS === W100_POS) return w100Div(i);

      tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() + 1));

      const isPastDate = tmpDate.getMonth() !== currMonth || tmpDate <= now;
      if (isPastDate) return notAvailableDateDiv(i, tmpDate);

      if (user.admin) return adminDateDiv(i, tmpDate);

      const tmpPerm: TPermesso = {
        username: user.username,
        date: dateFormat(tmpDate, "dd-mm-yyyy"),
      };
      if (isPrenotato(tmpPerm)) return prenotatoDateDiv(i, tmpDate);

      const permCount = getPermNum(tmpDate);
      return permCount > 0
        ? availableDateDiv(i, tmpDate, permCount)
        : notAvailableDateDiv(i, tmpDate);
    });
  }

  return (
    <div className="container-fluid mb-1">
      <div className="row justify-content-md-center align-items-center calendario-month">
        <div className="col-1">
          <button className="month-btn" id="prev-month-btn" onClick={decrDate}>
            <b>&lt;&lt;</b>
          </button>
        </div>
        <div className="col-2">
          <h1 className="current-month">{`${
            MONTHS[currDate.getMonth()]
          } ${currDate.getFullYear()}`}</h1>
        </div>
        <div className="col-1">
          <button className="month-btn" id="next-month-btn" onClick={incrDate}>
            <b>&gt;&gt;</b>
          </button>
        </div>
      </div>
      <div className="row justify-content-md-center calendario">
        <div className="col">
          <b>Lunedi</b>
        </div>
        <div className="col">
          <b>Martedi</b>
        </div>
        <div className="col">
          <b>Mercoledi</b>
        </div>
        <div className="col">
          <b>Giovedi</b>
        </div>
        <div className="col">
          <b>Venerdi</b>
        </div>
        <div className="col">
          <b>Sabato</b>
        </div>
        <div className="col">
          <b>Domenica</b>
        </div>
        <div className="w-100" />
        {queryPermessi.isSuccess && createCalendar(currDate)}
      </div>
    </div>
  );
}

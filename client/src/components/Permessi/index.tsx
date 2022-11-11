import React from "react";
import { User } from "../../types/User";
import UserDataService from "../../services/user";
import "./index.css";
import { Permesso } from "../../types/Permesso";
import { Nullable } from "../../types/Nullable";
import { TAlert } from "../../types/TAlert";
import Alert from "../Alert";
import dateFormat from "dateformat";
import { axiosErrHandl } from "../../utils/axiosErrHandl";

type Props = {
    user: User;
    alert: Nullable<TAlert>;
    openAlert: (alert: TAlert) => void;
    closeAlert: () => void;
}

const MONTHS: ReadonlyArray<string> = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const N_CALENDAR_ROWS = 6;
const N_CALENDAR_COLS = 8;
const W100_POS = N_CALENDAR_COLS - 1;
const N_DATE_DIVS = (N_CALENDAR_ROWS * N_CALENDAR_COLS) - 1;

const MAX_PERMESSI = 3;

const Calendario: React.FC<Props> = (props) => {
  const [currDate, setCurrDate] = React.useState(new Date());
  const [permessi, setPermessi] = React.useState<Permesso[]>([]);

  React.useEffect(() => {
    retrivePermessi();
  }, []);

  const availableDateDiv = (key: number, date: Date, disp: number) => (
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
  const notAvailableDateDiv = (key: number, date: Date) => (
    <div
      className="col date-div"
      key={key}
      data-not-available
    >{`${date.getDate()}`}</div>
  );
  const prenotatoDateDiv = (key: number, date: Date) => (
    <div className="col date-div" key={key} data-prenotato>
      <p>{`${date.getDate()}`}</p>
      <p>Prenotato</p>
    </div>
  );
  const w100Div = (key: number) => <div className="w-100" key={key}/>;
  const adminDateDiv = (key: number, date: Date) => {
    const dateStr = dateFormat(date, "dd-mm-yyyy");
    const prenotati = getUsersByDate(dateStr);

    return (
      <div className="col date-div" key={key}>
        <p>{`${date.getDate()}`}</p>
        <p>Disponibilità:{` ${MAX_PERMESSI - prenotati.length}`}</p>
        {prenotati.map((username, i) => (
          <>
            <span key={i + 1000}>{`${username} `}</span>
            <input
              type="checkbox"
              value={dateStr}
              onChange={checkBoxAdminEventHandl}
              data-username={username}
              key={i}
              checked
            />
          </>
        ))}
      </div>
    );
  }

  const addMonthsToDate = (date: Date, months: number) =>
    new Date(date.setMonth(date.getMonth() + months));
  const incrCurrDate = () => setCurrDate(addMonthsToDate(currDate, 1));
  const decrCurrDate = () => setCurrDate(addMonthsToDate(currDate, -1));
  
  const getPrevMonthFirstDate = (date: Date) => {
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDay = (firstDate.getDay() + 6) % 7;
    return new Date(firstDate.setDate(firstDate.getDate() - firstDay));
  };

  const retrivePermessi = async (permesso?: Permesso) => {
    try {
      const response = await UserDataService.getPermessi(permesso);
      console.log("retrivePermessi | response.data: ", response.data);
      setPermessi(response.data.data);
      return response.data.data;
    } catch(err) {
      console.error("retrivePermessi | ", err);
    }
  };

  const insertPermesso = async (permToAdd: Permesso) => {
    try {
      const response = await UserDataService.postPermesso(permToAdd);
      console.log("insertPermesso | response.data: ", response.data);

      setPermessi((prevState) => [...prevState, permToAdd]);
    } catch (err) {
      axiosErrHandl(err, props.openAlert, "insertPermessi | ");
    }
  };

  const deletePermesso = async (permToDel: Permesso) => {
    try {
      const response = await UserDataService.deletePermesso(permToDel);
      console.log("deletePermesso | response.data: ", response.data);

      setPermessi((prevState) =>
        prevState.filter(
          (perm) =>
            perm.username !== permToDel.username || perm.date !== permToDel.date
        )
      );
    } catch (err) {
      axiosErrHandl(err, props.openAlert, "deletePermesso | ");
    }
  };
  
  const checkboxEventHandl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value/*, parentElement*/ } = e.target;
    const tmpPerm: Permesso = { username: props.user.name, date: value };
    insertPermesso(tmpPerm)/*.then(() =>
      setDateDivToPrenotato(parentElement as HTMLDivElement)
    )*/;
  };

  // const setDateDivToPrenotato = (element: HTMLDivElement) => {
  //   if (element?.dataset) element.dataset.prenotato = "";
  //   const { children } = element;
  //   console.log(children);
  //   element.lastChild?.remove();
  //   const { lastChild } = element;
  //   if (lastChild) lastChild.textContent = "Prenotato";
  // };

  const checkBoxAdminEventHandl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, /*parentElement,*/ dataset } = e.target;
    const tmpPerm: Permesso = { username: dataset?.username || "", date: value};
    deletePermesso(tmpPerm)/*.then(() =>
      updateAdminDayDiv(parentElement as HTMLDivElement, tmpPerm.username)
    )*/;
  };

  const getUsersByDate = (date: Date | string) => {
    if (date instanceof Date) date = dateFormat(date, "dd-mm-yyyy");
    return permessi
      .filter((p) => p.date === date)
      .map((p) => p.username);
  };

  // const updateAdminDayDiv = (element: HTMLDivElement, username: string) => {
  //   const { children } = element;
  //   console.log(children);
  //   for(let i=2; i<children.length; i++) {
  //     if((children.item(i) as HTMLElement)?.dataset?.username === username) {
  //       console.log(children.item(i), children.item(i - 1));
  //       children.item(i)?.remove();
  //       children.item(i - 1)?.remove();
  //       break;
  //     }
  //   }
    
  //   const dispTxt = children.item(1);
  //   if (dispTxt?.textContent)
  //     dispTxt.textContent = `Disponibilità: ${MAX_PERMESSI - (children.length - 2) / 2 }`;
  // };

  const getPermNum = (date: Date | string) => {
    if(date instanceof Date) date = dateFormat(date, "dd-mm-yyyy");
    return MAX_PERMESSI - permessi.filter((p) => p.date === date).length;
  };

  const isPrenotato = (permesso: Permesso) =>
    permessi.find(
      (p) => p.date === permesso.date && p.username === permesso.username
    );
  
  
  const createCalendar = (date: Date) => {
    console.log("creatCalendar | ", date, permessi);

    const now = new Date();
    const currMonth = date.getMonth();

    let tmpDate = getPrevMonthFirstDate(date);
    tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() - 1));

    return [...Array(N_DATE_DIVS)].map((_v, i) => {
      if (i % N_CALENDAR_COLS === W100_POS)
        return w100Div(i);

      tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() + 1));

      const isPastDate =
        tmpDate.getMonth() !== currMonth || tmpDate <= now;
      if (isPastDate)
        return notAvailableDateDiv(i, tmpDate);

      if (props.user.admin)
        return adminDateDiv(i, tmpDate);

      const tmpPerm: Permesso = {
        username: props.user.name,
        date: dateFormat(tmpDate, "dd-mm-yyyy"),
      };
      if (isPrenotato(tmpPerm))
        return prenotatoDateDiv(i, tmpDate);

      const permCount = getPermNum(tmpDate);
      return permCount > 0
        ? availableDateDiv(i, tmpDate, permCount)
        : notAvailableDateDiv(i, tmpDate);
    });
  };

  return (
    <div className="container-fluid mb-1">
      <div className="row justify-content-md-center align-items-center calendario-month">
        <div className="col-1">
          <button
            className="month-btn"
            id="prev-month-btn"
            onClick={decrCurrDate}
          >
            <b>&lt;&lt;</b>
          </button>
        </div>
        <div className="col-2">
          <h1 className="current-month">{`${MONTHS[currDate.getMonth()]} ${currDate.getFullYear()}`}</h1>
        </div>
        <div className="col-1">
          <button
            className="month-btn"
            id="next-month-btn"
            onClick={incrCurrDate}
          >
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
        {createCalendar(currDate)}
      </div>
      <div className="calendario-alert-wrapper">
        <Alert alert={props.alert} closeAlert={props.closeAlert} />
      </div>
    </div>
  );
};

export default Calendario;
import dateFormat from "dateformat";
import React from "react";
import "./index.css";

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

const Calendario: React.FC<{}> = () => {
    const [currDate, setCurrDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState(
      dateFormat(new Date(), "yyyy-mm-dd")
    );

    const addMonthsToDate = (date: Date, months: number) =>
      new Date(date.setMonth(date.getMonth() + months));
    const incrCurrDate = () => setCurrDate(addMonthsToDate(currDate, 1));
    const decrCurrDate = () => setCurrDate(addMonthsToDate(currDate, -1));

    const dateDivOnClickEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const date = (e.target as HTMLInputElement).getAttribute("data-date");
      if(!date) return;
      setSelectedDate(date);
    };

    const dateDiv = (key: number, date: Date) => {
      const strDate = dateFormat(date, "yyyy-mm-dd");
      return (
        <div
          className="col date-div"
          key={key}
          data-date={strDate}
          data-selected-date={strDate === selectedDate}
          onClick={dateDivOnClickEvent}
        >{`${date.getDate()}`}</div>
      );
    };

    const notAvailableDateDiv = (key: number, date: Date) => (
      <div
        className="col date-div"
        key={key}
        data-not-available
      >{`${date.getDate()}`}</div>
    );

    const w100Div = (key: number) => <div className="w-100" key={key} />;

    const getPrevMonthFirstDate = (date: Date) => {
      const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const firstDay = (firstDate.getDay() + 6) % 7;
      return new Date(firstDate.setDate(firstDate.getDate() - firstDay));
    };

    const createCalendar = (date: Date) => {
      const currMonth = date.getMonth();

      let tmpDate = getPrevMonthFirstDate(date);
      tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() - 1));

      return [...Array(N_DATE_DIVS)].map((_v, i) => {
        if(i % N_CALENDAR_COLS === W100_POS) return w100Div(i);

        tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() + 1));

        return currMonth === tmpDate.getMonth()
          ? dateDiv(i, tmpDate)
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
            <h1 className="current-month">{`${
              MONTHS[currDate.getMonth()]
            } ${currDate.getFullYear()}`}</h1>
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
      </div>
    );
};

export default Calendario;
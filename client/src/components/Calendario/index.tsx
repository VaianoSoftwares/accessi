import dateFormat from "dateformat";
import React from "react";
import "./index.css";
import CalendarioDataService from "../../services/calendario";
import createFormData from "../../utils/createFormData";
import {
  N_DATE_DIVS,
  N_CALENDAR_COLS,
  W100_POS,
  MONTHS,
} from "../../utils/calendario";

type Props = {
  admin: boolean;
};

const Calendario: React.FC<Props> = (props: Props) => {
    const [currDate, setCurrDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState(
      dateFormat(new Date(), "yyyy-mm-dd")
    );
    const [filenames, setFilenames] = React.useState<Array<string>>([]);

    const addMonthsToDate = (date: Date, months: number) =>
      new Date(date.setMonth(date.getMonth() + months));
    const incrCurrDate = () => setCurrDate(addMonthsToDate(currDate, 1));
    const decrCurrDate = () => setCurrDate(addMonthsToDate(currDate, -1));

    React.useEffect(() => {
      retriveFilenames(selectedDate);
    }, [selectedDate]);

    const retriveFilenames = async (date: string) => {
      try {
        const response = await CalendarioDataService.getFilenames(date);
        console.log("retriveFilenames | response.data: ", response.data);

        const retrivedFilenames = response.data.data as Array<string>;
        setFilenames(retrivedFilenames);
      } catch(err) {
        console.error("retriveFilenames | ", err);
      }
    };

    const uploadFiles = async (data: FormData) => {
      try {
        const response = await CalendarioDataService.insertFiles(data);
        console.log("uploadFile | response.data", response.data);

        const filenamesAdded = response.data.data as Array<string>;

        setFilenames((prevState) =>
          Array.from(new Set([...filenamesAdded, ...prevState]))
        );
      } catch(err) {
        console.error("uploadFiles |", err);
      }
    };

    const deleteFile = async (date: string, filename: string) => {
      try {
        const response = await CalendarioDataService.deleteFile(date, filename);
        console.log("deleteFile | response.data", response.data);

        setFilenames((prevState) => prevState.filter((f) => f !== filename));
      } catch(err) {
        console.error("deleteFile |", err);
      }
    };

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

    const fileListEntryLink = (date: string, filename: string) => (
      <a
        className="file-list-link"
        href={
          process.env.NODE_ENV === "production"
            ? `/api/v1/public/calendario/${date}/${filename}`
            : `${process.env.REACT_APP_PROXY}/api/v1/public/calendario/${date}/${filename}`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {filename}
      </a>
    );

    const fileInputOnChangeEvent = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { files } = event.target;
      console.log(files);
      if (!files || files.length === 0) return;
      uploadFiles(createFormData({ date: selectedDate, files })).finally(
        () => (event.target.value = "")
      );
    };

    const btnDelFileOnClickEvent = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const target = event.currentTarget as HTMLButtonElement;
      const date = target.getAttribute("data-date");
      const filename = target.getAttribute("data-filename");
      if(!date || !filename) return;

      deleteFile(date, filename);
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
        <div className="row justify-content-md-center calendario mb-2">
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
        <div className="row calendar-form">
          <div className="col-6 calendar-file-list border">
            <ul className="list-group list-group-flush">
              {filenames.map((filename, i) => (
                <li className="list-group-item" key={i}>
                  {props.admin === true && (
                    <button
                      data-date={selectedDate}
                      data-filename={filename}
                      type="button"
                      className="close btn-del-file"
                      aria-label="Close"
                      onClick={btnDelFileOnClickEvent}
                    ><span aria-hidden="true">&times;</span></button>
                  )}{" "}
                  {fileListEntryLink(selectedDate, filename)}
                </li>
              ))}
            </ul>
          </div>
          <div className="col calendar-form">
            <input
              type="file"
              id="calendar-file-input"
              className="form-control form-control-lg"
              multiple
              onChange={fileInputOnChangeEvent}
              disabled={props.admin === false}
            />
          </div>
        </div>
      </div>
    );
};

export default Calendario;
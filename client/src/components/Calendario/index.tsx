import dateFormat from "dateformat";
import React from "react";
import "./index.css";
import CalendarioDataService from "../../services/calendario";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useDate from "../../hooks/useDate";
import useFormattedDate from "../../hooks/useFormattedDate";
import { N_DATE_DIVS, N_CALENDAR_COLS, W100_POS, MONTHS } from "../../types";

// function addMonthsToDate(date: Date, months: number) {
//   return new Date(date.setMonth(date.getMonth() + months));
// }

function notAvailableDateDiv(key: number, date: Date) {
  return (
    <div
      className="col date-div"
      key={key}
      data-not-available
    >{`${date.getDate()}`}</div>
  );
}

function w100Div(key: number) {
  return <div className="w-100" key={key} />;
}

function fileListEntryLink(date: string, filename: string) {
  return (
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
}

function getPrevMonthFirstDate(date: Date) {
  const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = (firstDate.getDay() + 6) % 7;
  return new Date(firstDate.setDate(firstDate.getDate() - firstDay));
}

export default function Calendario({ admin }: { admin: boolean }) {
  const inputFile = React.useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const [currDate, { incrDate, decrDate }] = useDate();
  const [selectedDate, setSelectedDate] = useFormattedDate(() =>
    queryFilenames.refetch()
  );

  // const [currDate, setCurrDate] = React.useState(new Date());
  // const [selectedDate, setSelectedDate] = React.useState(
  //   dateFormat(new Date(), "yyyy-mm-dd")
  // );

  const queryFilenames = useQuery({
    queryKey: ["filenames", selectedDate],
    queryFn: async (context) => {
      const response = await CalendarioDataService.getFilenames(
        context.queryKey[1]
      );
      console.log("retriveFilenames | response:", response);

      const result = response.data.data as string[];
      return result;
    },
  });

  const uploadFiles = useMutation({
    mutationFn: CalendarioDataService.insertFiles,
    onSuccess: async (response, variables) => {
      console.log("addFilenames | response", response);
      const varDate = variables.get("date")?.toString();
      await queryClient.invalidateQueries(["filenames", varDate]);
    },
    onError: async (err) => console.error("addFilenames | error:", err),
    onSettled: async () => {
      inputFile.current!.files = null;
      inputFile.current!.value = "";
    },
  });

  const deleteFile = useMutation({
    mutationFn: CalendarioDataService.deleteFile,
    onSuccess: async (response, variables) => {
      console.log("deleteFilenames | response", response);
      await queryClient.invalidateQueries(["filenames", variables.date]);
    },
    onError: async (err) => console.error("deleteFilename | error:", err),
  });

  // function incrCurrDate() {
  //   setCurrDate(addMonthsToDate(currDate, 1));
  // }

  // function decrCurrDate() {
  //   setCurrDate(addMonthsToDate(currDate, -1));
  // }

  // const [filenames, setFilenames] = React.useState<string[]>([]);

  // React.useEffect(() => {
  //   retriveFilenames(selectedDate);
  // }, [selectedDate]);

  // async function retriveFilenames(date: string) {
  //   try {
  //     const response = await CalendarioDataService.getFilenames(date);
  //     console.log("retriveFilenames | response.data: ", response.data);

  //     const retrivedFilenames = response.data.data as string[];
  //     setFilenames(retrivedFilenames);
  //   } catch (err) {
  //     console.error("retriveFilenames | ", err);
  //   }
  // }

  // async function uploadFiles(data: FormData) {
  //   try {
  //     const response = await CalendarioDataService.insertFiles(data);
  //     console.log("uploadFile | response.data", response.data);

  //     const filenamesAdded = response.data.data as string[];

  //     setFilenames((prevState) =>
  //       Array.from(new Set([...filenamesAdded, ...prevState]))
  //     );
  //   } catch (err) {
  //     console.error("uploadFiles |", err);
  //   }
  // }

  // async function deleteFile(date: string, filename: string) {
  //   try {
  //     const response = await CalendarioDataService.deleteFile({
  //       date,
  //       filename,
  //     });
  //     console.log("deleteFile | response.data", response.data);

  //     setFilenames((prevState) => prevState.filter((f) => f !== filename));
  //   } catch (err) {
  //     console.error("deleteFile |", err);
  //   }
  // }

  function dateDivOnClickEvent(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    const date = (e.target as HTMLInputElement).getAttribute("data-date")!;
    setSelectedDate(date);
  }

  function dateDiv(key: number, date: Date) {
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
  }

  function createCalendar(date: Date) {
    const currMonth = date.getMonth();

    let tmpDate = getPrevMonthFirstDate(date);
    tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() - 1));

    return [...Array(N_DATE_DIVS)].map((_v, i) => {
      if (i % N_CALENDAR_COLS === W100_POS) return w100Div(i);

      tmpDate = new Date(tmpDate.setDate(tmpDate.getDate() + 1));

      return currMonth === tmpDate.getMonth()
        ? dateDiv(i, tmpDate)
        : notAvailableDateDiv(i, tmpDate);
    });
  }

  function fileInputOnChangeEvent() {
    const { files } = inputFile.current!;
    if (!files || !files[0]) return;

    const formData = new FormData();
    formData.append("date", selectedDate);
    Array.from(files).forEach((file) => formData.append("files", file));

    // uploadFiles(formData).finally(() => {
    //   inputFile.current!.files = null;
    //   inputFile.current!.value = "";
    // });
    uploadFiles.mutate(formData);
  }

  function btnDelFileOnClickEvent(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    const target = event.currentTarget as HTMLButtonElement;
    const date = target.getAttribute("data-date")!;
    const filename = target.getAttribute("data-filename")!;

    // deleteFile(date, filename);
    deleteFile.mutate({ date, filename });
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
            {queryFilenames.isSuccess &&
              queryFilenames.data.map((filename, i) => (
                <li className="list-group-item" key={i}>
                  {admin === true && (
                    <button
                      data-date={selectedDate}
                      data-filename={filename}
                      type="button"
                      className="close btn-del-file"
                      aria-label="Close"
                      onClick={btnDelFileOnClickEvent}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  )}{" "}
                  {fileListEntryLink(selectedDate, filename)}
                </li>
              ))}
          </ul>
        </div>
        <div className="col calendar-form">
          {admin === true && (
            <input
              type="file"
              id="calendar-file-input"
              className="form-control form-control-lg"
              multiple
              onChange={fileInputOnChangeEvent}
              ref={inputFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

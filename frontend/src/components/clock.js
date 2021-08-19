import React from "react";
import "./clock.css";
import dateFormat from "dateformat";
dateFormat.i18n = {
  dayNames: [
    "DOM",
    "LUN",
    "MAR",
    "MER",
    "GIO",
    "VEN",
    "SAB",
    "DOMENICA",
    "LUNEDI",
    "MARTEDI",
    "MERCOLEDI",
    "GIOVEDI",
    "VENERDI",
    "SABATO",
  ],
  monthNames: [
    "GEN",
    "FEB",
    "MAR",
    "APR",
    "MAG",
    "GIU",
    "LUG",
    "AGO",
    "SET",
    "OTT",
    "NOV",
    "DIC",
    "GENNAIO",
    "FEBBRAIO",
    "MARZO",
    "APRILE",
    "MAGGIO",
    "GIUGNO",
    "LUGLIO",
    "AGOSTO",
    "SETTEMBRE",
    "OTTOBRE",
    "NOVEMBRE",
    "DICEMBRE",
  ],
};

const Clock = () => {
    const clockInitialState = {
        ora: "",
        data: ""
    };
    const [clock, setClock] = React.useState(clockInitialState);

    const updateTime = () => {
        const now = new Date();
        let newClockState = {};
        newClockState.ora = dateFormat(now, "HH:MM:ss");
        newClockState.data = dateFormat(now, "dddd dd mmmm yyyy");
        setClock(newClockState);
    };

    setInterval(updateTime, 1000);

    return (
        <div id="orologio">
            <p className="tempo">{clock.ora}</p>
            <p className="data">{clock.data}</p>
        </div>
    );
};

export default Clock;
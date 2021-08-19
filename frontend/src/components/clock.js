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

export default class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ora: dateFormat(new Date(), "HH:MM:ss"), 
      data: dateFormat(new Date(), "dddd dd mmmm yyyy") 
    };
  }

  tick() {
    this.setState({
      ora: dateFormat(new Date(), "HH:MM:ss"), 
      data: dateFormat(new Date(), "dddd dd mmmm yyyy") 
    });
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    return (
      <div id="orologio">
        <p className="tempo">{this.state.ora}</p>
        <p className="data">{this.state.data}</p>
      </div>
    );
  }
};
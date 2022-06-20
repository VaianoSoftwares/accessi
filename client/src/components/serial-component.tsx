import React from "react";
import { Nullable } from "../types/Nullable";
import { TAlert } from "../types/TAlert";
import utf8ArrayToStr from "../utils/utf8ArrayToStr";

type Props = {
  setScannedValue: React.Dispatch<React.SetStateAction<string>>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
};

type SerialCompStates = {
  connected: boolean;
};

export default class SerialComponent extends React.Component<
  Props,
  SerialCompStates
> {
  constructor(props: Props) {
    super(props);
    this.state = { connected: false };
  }

  async init() {
    let port: SerialPort | undefined;

    try {
      if (!("serial" in window.navigator)) {
        console.error(
          "Web serial doesn't seem to be enabled in your browser. Try enabling it by visiting:"
        );
        console.error(
          "chrome://flags/#enable-experimental-web-platform-features"
        );
        console.error(
          "opera://flags/#enable-experimental-web-platform-features"
        );
        console.error(
          "edge://flags/#enable-experimental-web-platform-features"
        );
        throw new Error("Api non disponibile");
      }

      port = await window.navigator.serial.requestPort();
      if(!port) throw new Error("Nessun dispositivo seriale selezionato");

      await port.open({ baudRate: 57600 }); // Wait for the serial port to open.
      console.log("serialApi init - Aperta porta seriale.");
      this.setState({ connected: true });

      port.onconnect = async (e: Event) => await this.read(e);
      port.ondisconnect = async (e: Event) => await this.close(e);
      port.dispatchEvent(new Event("connect"));
    } catch (err) {
      console.error(`serialApi init - ${err}`);
      if (err instanceof Error) {
        const errMsg = "The port is already open";
        if (err.message.includes(errMsg)) this.setState({ connected: true });
        else
          this.props.setAlert({ success: false, msg: err.message });
      }
    }
  }

  async read(event: Event) {
    if(!event.target) return;

    const port = event.target as SerialPort;

    while (port.readable) {
      const reader = port.readable.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          console.log(`serialApi read - value: ${value} - done: ${done}`);

          if (done) {
            reader.releaseLock();
            break;
          }

          const decodedVal = utf8ArrayToStr(value);
          const trimmedVal = decodedVal
            .replace(/[\n\r]+/g, "")
            .replace(/\s+/g, "")
            .trim();
          console.log(`serialApi read - trimmedVal: ${trimmedVal}`);
          if (trimmedVal.length < 3 || trimmedVal[0] === "-")
            throw new Error(`serialApi read - ${trimmedVal} codice non valido`);
          this.props.setScannedValue(trimmedVal);
        }
      } catch (err) {
        console.error(`serialApi read - ${err}`);
        if(err instanceof Error)
          this.props.setAlert({ success: false, msg: err.message });
      }
    }
  }

  async close(event: Event) {
    try {
      const port = event.target as SerialPort;
      if(port) await port.close(); //disconessione da seriale
      console.log("serialApi close - Disconnessione a porta seriale.");
    } catch (err) {
      console.error(`serialApi close - ${err}`);
      if(err instanceof Error)
        this.props.setAlert({ success: false, msg: err.message });
    } finally {
      this.setState({ connected: false });
    }
  }
  
  render() {
    return (
      <>
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary home-form-btn"
            id="serial-conn-btn"
            onClick={async () => await this.init()}
          >
            Scanner
          </button>
        </div>
        <div className="col-auto mx-2 home-form-b">
          <b
            style={this.state.connected ? { color: "green" } : { color: "red" }}
          >
            {!this.state.connected && "Non "}
            {"Connesso"}
          </b>
        </div>
      </>
    );
  }
}

import React from "react";
import utf8ArrayToStr from "../utils/utf8ArrayToStr";

type Props = {
  setScannedValue: React.Dispatch<React.SetStateAction<string>>;
};

type SerialCompStates = {
  connected: boolean;
};

export default class SerialComponent extends React.Component<Props, SerialCompStates> {
  constructor(props: Props) {
    super(props);
    this.state = { connected: false };
  }

  async init(openPrompt: boolean = true) {
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
        throw new Error("api not available");
      }

      if (openPrompt) {
        port = await window.navigator.serial.requestPort();
      } else {
        const ports = await window.navigator.serial.getPorts();
        if (ports.length > 0) {
          port = ports[0];
        }
        console.log(ports);
      }

      if (!port) {
        throw new Error("port not found");
      }
      
      await port.open({ baudRate: 57600 }); // Wait for the serial port to open.
      console.log("serialApi init - Aperta porta seriale.");
      this.setState({ connected: true });

      port.onconnect = async (e: Event) => await this.read(e);
      port.ondisconnect = async (e: Event) => await this.close(e);
      port.dispatchEvent(new Event("connect"));
    } catch (err) {
      console.log(`serialApi init - ${err}`);
    }
  }

  /*
  decodeSerialOut(value?: Uint8Array) {
    if(!value) return "";

    const chCodeArr = String(value)
        .split(",")
        .map(elem => Number(elem));
    
    return String.fromCharCode(...chCodeArr)
        //.replace(/[\n\r]+/g, "")
        //.replace(/\s{2,10}/g, " ")
        .trim();
  }
  */

  async read(event: Event) {
    if (!event.target) {
      return;
    }

    const port = event.target as SerialPort;

    while(port.readable) {
      const reader = port.readable.getReader();
      
      try {
        while(true) {
          const { value, done } = await reader.read();
          console.log(`serialApi read - value: ${value} - done: ${done}`);

          if(done) {
            reader.releaseLock();
            break;
          }

          const decodedVal = utf8ArrayToStr(value);
          console.log(`serialApi read - decodedVal: ${decodedVal}`);
          if(decodedVal.length >= 3 && decodedVal[0] !== '-') {
            this.props.setScannedValue(decodedVal);
          }
        }
      } catch(err) {
        console.log(`serialApi read - ${err}`);
      }
    }

    /*
    const port = event.target;
    // eslint-disable-next-line no-undef
    const textDecoder = new TextDecoderStream();
    let readableStreamClosed;
    let reader;
    
    try {
      readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      reader = textDecoder.readable.getReader();
      console.log(reader, readableStreamClosed);
      console.log("serialApi read - In ascolto su porta seriale...");

      while (true) {
        const { value, done } = await reader.read();
        console.log(`serialApi read - value: ${value} - done: ${done}`);

        if (done) {
          break;
        }

        const trimmedVal = value
          .replace(/[\n\r]+/g, "")
          .replace(/\s{2,10}/g, " ")
          .trim();

        console.log(`serialApi read - value (trimmed): ${trimmedVal}`);
        this.props.setScannedValue(trimmedVal);
      }
    } catch (err) {
      console.log(`serialApi read - ${err}`);
    } finally {
      if(reader && reader.locked === true) {
        reader.releaseLock();
      }
      port.dispatchEvent(
        new CustomEvent("disconnect", {
          bubbles: true,
          detail: { reader, readableStreamClosed },
        })
      );
    }*/
  }

  async close(event: Event) {
    /*
    if (!event || !event.detail) {
      return;
    }
    */

    try {
      const port = event.target as SerialPort;
      /*const { reader, readableStreamClosed } = event.detail;

      if(readableStreamClosed) {
        await readableStreamClosed.catch(() => {}); //chiusura stream lettura
      }

      if (reader && reader.locked === true) {
        await reader.cancel(); //chiusura lettore seriale
      }*/
      
      if(port) {
        await port.close(); //disconessione da seriale
      }
      console.log("serialApi close - Disconnessione a porta seriale.");
    } catch (err) {
      console.log(`serialApi close - ${err}`);
    } finally {
      this.setState({ connected: false });
    }
  }
  /*
  async componentDidMount() {
    await this.init(false);
  }
  */
  render() {
    return (
      <div className="row">
        <div className="col-sm-5">
          <button
            className="btn btn-outline-secondary"
            id="serial-conn-btn"
            onClick={async () => await this.init(true)}
          >
            Connetti Seriale
          </button>
        </div>
        <div className="col-sm-5">
          <b style={this.state.connected ? {"color": "green"} : {"color": "red"}}>{!this.state.connected && "Non "}{"Connesso"}</b>
        </div>
      </div>
    );
  }
}
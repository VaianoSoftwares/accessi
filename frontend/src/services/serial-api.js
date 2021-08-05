class SerialApi {
  static async connect() {
    try {
      if (!("serial" in navigator)) {
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

      let serialPort = await navigator.serial.requestPort(); // Prompt user to select any serial port.
      await serialPort.open({ baudRate: 9600 }); // Wait for the serial port to open.
      console.log("serialApi - Connesso a porta seriale");

      return serialPort;
    } catch (err) {
      console.error(`serialApi - connect - ${err}`);
      return { error: err };
    }
  }

  static async close(readableStreamClosed, serialReader, serialPort) {
    try {
      await readableStreamClosed.catch(() => {
        /* Ignore the error */
      }); //chiusura stream lettura
      await serialReader.cancel(); //chiusura lettore seriale

      await serialPort.close(); //disconessione da seriale

      console.log("serialApi - Disconnessione a porta seriale.");
    } catch (err) {
      console.error(`serialApi - close - ${err}`);
      return { error: err };
    }
  }
}

export default SerialApi;
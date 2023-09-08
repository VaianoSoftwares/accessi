import React from "react";
import { toast } from "react-hot-toast";
import utf8ArrayToStr from "./utf8ArrayToStr";

async function initScanner() {
  try {
    const port = await navigator.serial.requestPort();
    if (!port) throw new Error("Nessun dispositivo selezionato");

    await port.open({ baudRate: 57600 });
    console.log("initScanner | Aperta porta seriale.", port.getInfo());

    return port;
  } catch (err) {
    console.error("initScanner |", err);
  }
}

async function readScanner(
  port: SerialPort,
  setValue: (value: string) => void
) {
  while (port.readable) {
    const reader = port.readable.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        console.log("readScanner | value:", value, "- done:", done);

        if (done) break;

        const trimmedValue = utf8ArrayToStr(value)
          .replace(/[\n\r\s]+/g, "")
          .trim();
        console.log("readScanner | value:", trimmedValue);

        if (trimmedValue.length < 3 || trimmedValue[0] === "-") continue;

        setValue(trimmedValue);
      }
    } catch (err) {
      console.error("readScanner |", err);
    } finally {
      reader.releaseLock();
    }
  }

  await port.close();
  console.log("readScanner | Chiusa porta seriale.", port.getInfo());
}

export default async function runScanner(
  setValue: (value: string) => void,
  setScanner: (value: React.SetStateAction<SerialPort | undefined>) => void
) {
  try {
    const port = await initScanner();
    if (!port) throw new Error("Impossibile aprire porta seriale");

    setScanner(port);
    await readScanner(port, setValue);
    setScanner(undefined);
  } catch (err) {
    console.error("runScanner |", err);
    toast.error(String(err));
  }
}

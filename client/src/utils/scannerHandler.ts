import React from "react";
import { toast } from "react-hot-toast";
import utf8ArrayToStr from "./utf8ArrayToStr";

export default async function runScanner(
  setValue: (value: string) => void,
  setIsScannerConnected: (value: React.SetStateAction<boolean>) => void
) {
  let port: SerialPort;
  try {
    port = await navigator.serial.requestPort();
  } catch (e) {
    console.error(e);
    return;
  }

  try {
    await port.open({ baudRate: 57600 });
  } catch (e) {
    console.error(e);
    toast.error("Impossibile aprire porta seriale");
    return;
  }

  setIsScannerConnected(true);

  console.log("Dispositivo seriale connesso", port.getInfo());

  while (port.readable) {
    const reader = port.readable.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        console.log("readScanner |", { value, done });

        if (done) break;

        const trimmedValue = utf8ArrayToStr(value)
          .replace(/[\n\r\s]+/g, "")
          .trim();
        console.log("readScanner | value:", trimmedValue);

        if (
          (trimmedValue.length === 10 || trimmedValue.length === 7) &&
          /^\d+$/.test(trimmedValue)
        )
          setValue(trimmedValue);
      }
    } catch (e) {
      console.error(e);
      toast.error("Dispositivo seriale disconnesso");
    } finally {
      reader.releaseLock();
      await port.close();

      setIsScannerConnected(false);

      console.log("readScanner | Chiusa porta seriale", port.getInfo());
    }
  }
}

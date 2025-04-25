import { toast } from "react-hot-toast";
import utf8ArrayToStr from "../utils/utf8ArrayToStr";
import { useState, useCallback, useEffect, useRef } from "react";

export default function useSerialScanner() {
  const [isConnected, setIsConnected] = useState(false);
  const [scanValues, setScanValues] = useState<string[]>([]);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );

  const addScanValue = useCallback((value: string) => {
    setScanValues((prev) => [...prev, value]);
  }, []);

  const removeScanValue = useCallback((value: string) => {
    setScanValues((prev) => prev.filter((v) => value !== v));
  }, []);

  const clearScanValues = useCallback(() => {
    setScanValues([]);
  }, []);

  const connect = useCallback(async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 57600 });
      portRef.current = port;

      setIsConnected(true);
      console.log("Dispositivo seriale connesso", port.getInfo());

      const reader = port.readable!.getReader();
      readerRef.current = reader;

      const readLoop = async () => {
        while (true) {
          const { value, done } = await reader.read();
          console.log("readScanner |", { value, done });

          if (done) break;

          const trimmedValue = utf8ArrayToStr(value)
            .replace(/[\n\r\s]+/g, "")
            .trim();
          console.log("readScanner | value:", trimmedValue);

          if (
            trimmedValue.length <= 10 &&
            trimmedValue.length >= 7 &&
            /^\d+$/.test(trimmedValue)
          ) {
            addScanValue(trimmedValue);
          }
        }
      };

      readLoop().catch((e) => {
        console.error(e);
        toast.error("Errore durante la lettura della porta seriale");
      });
    } catch (e) {
      console.error(e);
      if (!(e instanceof Error) || e.name !== "NotFoundError") {
        toast.error("Errore durante l'apertura della porta seriale");
      }
    }
  }, [addScanValue]);

  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }

      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }

      setIsConnected(false);
      console.log("Disconnesso dispositivo seriale");
    } catch (e) {
      console.error(e);
      toast.error("Errore durante la chiusura della porta seriale");
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    scanValues,
    addScanValue,
    removeScanValue,
    clearScanValues,
  };
}

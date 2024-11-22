import { useEffect, useState } from "react";

export default function useSSE<T>(eventUrl: string, initialState: T) {
  const [listening, setListening] = useState(false);
  const [data, setData] = useState<T>(initialState);

  useEffect(() => {
    if (listening) return;

    const events = new EventSource(eventUrl);

    events.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch {}
    };

    setListening(true);
  }, [listening, data]);

  return { data, setData, listening } as const;
}

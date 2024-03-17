import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useSessionStorage<S>(
  storageKey: string,
  fallbackState: S
): [S, Dispatch<SetStateAction<S>>] {
  const [value, setValue] = useState<S>(() => {
    const storageValue = sessionStorage.getItem(storageKey);
    return storageValue ? JSON.parse(storageValue) : fallbackState;
  });

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(value));

    return () => {
      sessionStorage.removeItem(storageKey);
    };
  }, [value, storageKey]);

  return [value, setValue];
}

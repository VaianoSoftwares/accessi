import React, { useEffect, useState } from "react";

type TReturnValue<S> = [S, React.Dispatch<React.SetStateAction<S>>];

export default function useSessionStorage<S>(
  storageKey: string,
  fallbackState: S
): TReturnValue<S> {
  const [value, setValue] = useState<S>(() => {
    const storageValue = sessionStorage.getItem(storageKey);
    return storageValue ? JSON.parse(storageValue) : fallbackState;
  });

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
}

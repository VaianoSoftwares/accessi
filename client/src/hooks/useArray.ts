import { useState } from "react";

export default function useArray<T>() {
  const [array, setArray] = useState<T[]>([]);

  function addElement(value: T) {
    setArray((prevState) => Array.from(new Set([value, ...prevState])));
  }
  function removeElement(value: T) {
    setArray((prevState) => prevState.filter((elem) => elem !== value));
  }
  function clearArray() {
    setArray([]);
  }

  return { array, addElement, removeElement, clearArray } as const;
}

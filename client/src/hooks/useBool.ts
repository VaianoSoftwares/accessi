import { useState } from "react";

type TUseBool = [
  boolean,
  { setTrue: () => void; setFalse: () => void; setToggle: () => void }
];

export default function useBool(initialState = false): TUseBool {
  const [state, setState] = useState(initialState);

  function setTrue() {
    setState(true);
  }

  function setFalse() {
    setState(false);
  }

  function setToggle() {
    setState((prev) => !prev);
  }

  return [state, { setTrue, setFalse, setToggle }];
}

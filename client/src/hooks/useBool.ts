import { useState } from "react";

export default function useBool(initialState = false) {
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

  return [state, { setTrue, setFalse, setToggle }] as const;
}

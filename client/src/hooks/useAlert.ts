import { useState } from "react";
import { TAlert } from "../types";

export default function useAlert(initialState: TAlert | null = null) {
  const [state, setState] = useState<TAlert | null>(initialState);

  function openAlert(alert: TAlert) {
    setState(alert);
  }

  function closeAlert() {
    setState(null);
  }

  return [state, { openAlert, closeAlert }] as const;
}

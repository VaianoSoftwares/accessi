import { useState } from "react";
import { TAlert } from "../types";

type TUseAlert = [
  TAlert | null,
  { openAlert: (alert: TAlert) => void; closeAlert: () => void }
];

export default function useAlert(
  initialState: TAlert | null = null
): TUseAlert {
  const [state, setState] = useState<TAlert | null>(initialState);

  function openAlert(alert: TAlert) {
    setState(alert);
  }

  function closeAlert() {
    setState(null);
  }

  return [state, { openAlert, closeAlert }];
}

import { useEffect } from "react";
import useBool from "./useBool";

type TUseReadonlyForm = [
  boolean,
  { setTrue: () => void; setFalse: () => void; setToggle: () => void }
];

export default function useReadonlyForm(
  effectCallback: (condition: boolean) => void
): TUseReadonlyForm {
  const [readonlyForm, setReadonlyForm] = useBool(true);

  useEffect(() => effectCallback(readonlyForm), [readonlyForm]);

  return [readonlyForm, setReadonlyForm];
}

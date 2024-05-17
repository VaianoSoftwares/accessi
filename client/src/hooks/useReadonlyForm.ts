import { useEffect } from "react";
import useBool from "./useBool";

export default function useReadonlyForm(
  effectCallback: (condition: boolean) => void
) {
  const [readonlyForm, setReadonlyForm] = useBool(true);

  useEffect(() => effectCallback(readonlyForm), [readonlyForm]);

  return [readonlyForm, setReadonlyForm] as const;
}

import dateFormat from "dateformat";
import { useEffect, useState } from "react";

export default function useSelectedDate(
  effectCallback: () => void,
  initialValue?: string
) {
  const [value, setValue] = useState(
    initialValue || dateFormat(new Date(), "yyyy-mm-dd")
  );

  useEffect(effectCallback, [value]);

  return [value, setValue] as const;
}

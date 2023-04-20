import dateFormat from "dateformat";
import React, { useEffect, useState } from "react";

type TUseFormattedDate = [string, React.Dispatch<React.SetStateAction<string>>];

export default function useSelectedDate(
  effectCallback: () => void,
  initialValue?: string
): TUseFormattedDate {
  const [value, setValue] = useState(
    initialValue || dateFormat(new Date(), "yyyy-mm-dd")
  );

  useEffect(effectCallback, [value]);

  return [value, setValue];
}

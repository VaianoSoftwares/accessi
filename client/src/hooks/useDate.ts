import { useState } from "react";

type TUseDate = [Date, { incrDate: () => void; decrDate: () => void }];

function addMonthsToDate(date: Date, months: number) {
  return new Date(date.setMonth(date.getMonth() + months));
}

export default function useDate(initialValue = new Date()): TUseDate {
  const [value, setValue] = useState(initialValue);

  function incrDate() {
    setValue(addMonthsToDate(value, 1));
  }

  function decrDate() {
    setValue(addMonthsToDate(value, -1));
  }

  return [value, { incrDate, decrDate }];
}

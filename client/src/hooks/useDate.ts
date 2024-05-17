import { useState } from "react";

function addMonthsToDate(date: Date, months: number) {
  return new Date(date.setMonth(date.getMonth() + months));
}

export default function useDate(initialValue = new Date()) {
  const [value, setValue] = useState(initialValue);

  function incrDate() {
    setValue(addMonthsToDate(value, 1));
  }

  function decrDate() {
    setValue(addMonthsToDate(value, -1));
  }

  return [value, { incrDate, decrDate }] as const;
}

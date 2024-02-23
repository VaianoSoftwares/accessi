type TMonths =
  | "Gennaio"
  | "Febbraio"
  | "Marzo"
  | "Aprile"
  | "Maggio"
  | "Giugno"
  | "Luglio"
  | "Agosto"
  | "Settembre"
  | "Ottobre"
  | "Novembre"
  | "Dicembre";

export const MONTHS: ReadonlyArray<TMonths> = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

export const N_CALENDAR_ROWS = 6;
export const N_CALENDAR_COLS = 8;
export const W100_POS = N_CALENDAR_COLS - 1;
export const N_DATE_DIVS = N_CALENDAR_ROWS * N_CALENDAR_COLS - 1;

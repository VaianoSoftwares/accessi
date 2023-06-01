import { utils, writeFileXLSX } from "xlsx";

export default function tableToXLSX(tableId: string) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const wb = utils.table_to_book(table);
  writeFileXLSX(wb, `in-struttura-${new Date().toLocaleString()}.xlsx`);
}

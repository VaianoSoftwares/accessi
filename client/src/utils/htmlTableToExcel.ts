import { utils, writeFileXLSX } from "xlsx";

export default function tableToXLSX(tableId: string, prefix = "table") {
  const table = document.getElementById(tableId);
  if (!table) return;

  const wb = utils.table_to_book(table);
  writeFileXLSX(wb, `${prefix}-${new Date().toLocaleString()}.xlsx`);
}

import pkg, { QueryResultRow } from "pg";
const { Pool } = pkg;

const pool = new Pool();

export async function query<T extends QueryResultRow = any>(
  text: string,
  values?: any[]
) {
  const timerStart = Date.now();
  const res = await pool.query<T>(values ? { text, values } : text);
  const execTime = Date.now() - timerStart;
  console.log("Executed query", {
    text,
    values,
    execTime,
    rowCount: res.rowCount,
    rows: res.rows,
  });
  return res;
}

export function getClient() {
  return pool.connect();
}

export function getInsertRowQuery(tableName: string, insertData: object) {
  const rowFields = Object.keys(insertData);
  const rowFieldsText = rowFields.join(",");
  const rowValuesText = rowFields.map((_, i) => `$${i + 1}`).join(",");

  const queryText = [
    "INSERT INTO",
    tableName,
    "(",
    rowFieldsText,
    ") VALUES (",
    rowValuesText,
    ") RETURNING *",
  ].join(" ");
  const queryValues = Object.values(insertData);

  return { queryText, queryValues };
}

export function getUpdateRowsQuery(
  tableName: string,
  updateData: object,
  filter?: object
) {
  let i = 1;

  const updateText = Object.entries(updateData)
    .filter(([, value]) => value)
    .map(([key]) => `${key}=$${i++}`)
    .join(",");
  const updateValues = Object.values(updateData).filter(
    (value) => value !== "" && value !== undefined
  );

  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key]) => `${key}=$${i++}`)
      .join(" AND ");
  const filterValues =
    filter &&
    Object.values(filter).filter(
      (value) => value !== "" && value !== undefined
    );

  const prefixText = `UPDATE ${tableName} SET ${updateText}`;

  const queryText = filterText
    ? [prefixText, filterText].join(" WHERE ")
    : prefixText;
  const queryValues = updateValues.concat(filterValues);

  return { queryText, queryValues };
}

export function getDeleteRowsQuery(tableName: string, filter?: object) {
  const prefixText = `DELETE FROM ${tableName}`;
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key], i) => `${key}=$${i + 1}`)
      .join(" AND ");

  const queryValues = filter && Object.values(filter).filter((value) => value);
  const queryText = filterText
    ? [prefixText, filterText].join(" WHERE ")
    : prefixText;

  return { queryText, queryValues };
}

export async function insertRow<T extends QueryResultRow>(
  tableName: string,
  insertData: object
) {
  const { queryText, queryValues } = getInsertRowQuery(tableName, insertData);
  return await query<T>(queryText, queryValues);
}

export async function updateRows<T extends QueryResultRow>(
  tableName: string,
  updateData: object,
  filter?: object
) {
  const { queryText, queryValues } = getUpdateRowsQuery(
    tableName,
    updateData,
    filter
  );
  return await query<T>(queryText, queryValues);
}

export async function deleteRows<T extends QueryResultRow>(
  tableName: string,
  filter?: object
) {
  const { queryText, queryValues } = getDeleteRowsQuery(tableName, filter);
  return await query<T>(queryText, queryValues);
}

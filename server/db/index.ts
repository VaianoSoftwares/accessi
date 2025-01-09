import pg, { QueryResultRow } from "pg";
const { Pool } = pg;
pg.types.setTypeParser(20, (v) => {
  const vAsInt = Number.parseInt(v);
  return Number.isSafeInteger(vAsInt) ? vAsInt : null;
});

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
});

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

export function getSelectRowQuery(
  tableName: string,
  options: { selections?: Record<PropertyKey, any>; projections?: string[] }
) {
  const { selections, projections } = options;

  let queryText = `SELECT ${
    projections ? projections.join(",") : "*"
  } FROM ${tableName}`;
  const queryValues: any[] = [];

  const selectionStr =
    selections &&
    Object.entries(selections)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value], i) => {
        switch (typeof value) {
          case "string":
            queryValues.push(`%${value}%`);
            return `${key} LIKE $${i + 1}`;
          case "number":
          case "boolean":
            queryValues.push(value);
            return `${key}=$${i + 1}`;
          case "object":
            return value === null ? `${key} IS NULL` : "";
          default:
        }
      })
      .filter((str) => str)
      .join(" AND ");
  queryText += selectionStr ? ` WHERE ${selectionStr}` : "";

  return { queryText, queryValues };
}

export function getInsertRowQuery(
  tableName: string,
  insertData: Record<PropertyKey, any>
) {
  const rowEntries = Object.entries(insertData).filter(
    ([, value]) => value !== undefined && value !== ""
  );
  const rowFieldsText = rowEntries.map(([key]) => key).join(",");
  const rowValuesText = rowEntries.map((_, i) => `$${i + 1}`).join(",");

  const queryText = [
    "INSERT INTO",
    tableName,
    "(",
    rowFieldsText,
    ") VALUES (",
    rowValuesText,
    ") RETURNING *",
  ].join(" ");
  const queryValues = rowEntries.map(([, value]) => value);

  return { queryText, queryValues };
}

export function getUpdateRowsQuery(
  tableName: string,
  updateData: Record<PropertyKey, any>,
  filter?: Record<PropertyKey, any>
) {
  let i = 1;

  const updateText = Object.entries(updateData)
    .filter(([, value]) => value)
    .map(([key]) => `${key}=$${i++}`)
    .join(",");
  if (!updateText) return { queryText: "", queryValues: [] };
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
    ? [prefixText, "WHERE", filterText, "RETURNING *"].join(" ")
    : [prefixText, "RETURNING *"].join(" ");
  const queryValues = updateValues.concat(filterValues);

  return { queryText, queryValues };
}

export function getDeleteRowsQuery(
  tableName: string,
  filter?: Record<PropertyKey, any>
) {
  const prefixText = `DELETE FROM ${tableName}`;
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key], i) => `${key}=$${i + 1}`)
      .join(" AND ");

  const queryValues = filter && Object.values(filter).filter((value) => value);
  const queryText = filterText
    ? [prefixText, "WHERE", filterText, "RETURNING *"].join(" ")
    : [prefixText, "RETURNING *"].join(" ");

  return { queryText, queryValues };
}

export async function insertRow<T extends QueryResultRow>(
  tableName: string,
  insertData: Record<PropertyKey, any>
) {
  const { queryText, queryValues } = getInsertRowQuery(tableName, insertData);
  return await query<T>(queryText, queryValues);
}

export async function updateRows<T extends QueryResultRow>(
  tableName: string,
  updateData: Record<PropertyKey, any>,
  filter?: Record<PropertyKey, any>
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
  filter?: Record<PropertyKey, any>
) {
  const { queryText, queryValues } = getDeleteRowsQuery(tableName, filter);
  return await query<T>(queryText, queryValues);
}

import { Person } from "../types/people.js";
import {
  FindPeoplesFilter,
  InsertPersonData,
  UpdatePersonData,
} from "../utils/validation.js";
import * as db from "./index.js";

export async function getPeoples(filter?: FindPeoplesFilter) {
  const prefixText = "SELECT * FROM people";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value], i) => {
        switch (key) {
          case "scadenza":
            return `scadenza <= ${i + 1}`;
          default:
            return typeof value === "string"
              ? `${key} LIKE $${i + 1}`
              : `${key}=$${i + 1}`;
        }
      })
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, "WHERE", filterText].join(" ")
    : prefixText;
  const queryValues =
    filter &&
    Object.values(filter)
      .filter((value) => value)
      .map((value) => (typeof value !== "string" ? value : `%${value}%`))
      .flat();

  return await db.query(queryText, queryValues);
}

export async function insertPerson(data: InsertPersonData) {
  return await db.insertRow("people", data);
}

export async function updatePerson(data: UpdatePersonData) {
  return await db.updateRows("people", data.updateData, {
    id: data.id,
  });
}

export async function deletePerson(id: number) {
  return await db.deleteRows("people", { id });
}

export function getAssegnazioni() {
  return db.query<{ value: string }>("SELECT * FROM assegnazioni");
}

export function getPersonById(id: number) {
  return db.query<Person>("SELECT * FROM people WHERE id = $1", [id]);
}

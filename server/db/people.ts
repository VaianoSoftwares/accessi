import { Person } from "../types/badges.js";
import {
  FindPeopleFilter,
  InsertPersonData,
  UpdatePersonData,
} from "../utils/validation.js";
import * as db from "./index.js";

const tableName = "nominativi";

export default class PeopleDB {
  public static async getPeople(filter?: FindPeopleFilter) {
    const { queryText, queryValues } = db.getSelectRowQuery(tableName, {
      selections: filter,
    });
    return await db.query(queryText, queryValues);
  }

  public static async insertPerson(data: InsertPersonData) {
    return await db.insertRow<Person>(tableName, data);
  }

  public static async updatePerson(data: UpdatePersonData) {
    return await db.updateRows<Person>(tableName, data.updateData, {
      id: data.id,
    });
  }

  public static async deletePerson(id: number) {
    return await db.deleteRows<Person>(tableName, { id });
  }
}

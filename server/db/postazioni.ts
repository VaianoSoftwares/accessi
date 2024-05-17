import { BasePostazione, Postazione } from "../types/users.js";
import { FindPostazioniData } from "../utils/validation.js";
import * as db from "./index.js";

export default class PostazioniDB {
  public static getClienti() {
    return db.query<{ name: string }>("SELECT * FROM clienti");
  }

  public static insertCliente(cliente: string) {
    return db.query("INSERT INTO clienti (name) VALUES ($1)", [cliente]);
  }

  public static deleteCliente(cliente: string) {
    return db.query("DELETE FROM clienti WHERE name = $1", [cliente]);
  }

  public static async getPostazioni(filter?: FindPostazioniData) {
    let i = 1;

    const prefixText = "SELECT * FROM postazioni";
    const filterText =
      filter &&
      Object.entries(filter)
        .filter(([, value]) => value)
        .map(([key]) => {
          switch (key) {
            case "ids":
              return Array.isArray(filter.ids)
                ? filter.ids.map(() => `id=$${i++}`).join(" OR ")
                : "";
            default:
              return `${key}=$${i++}`;
          }
        })
        .join(" AND ");

    const queryText = filterText
      ? [prefixText, filterText].join(" WHERE ")
      : prefixText;
    const queryValues =
      filter &&
      Object.values(filter)
        .filter((value) => value)
        .flat();
    console.log("postazioni", { queryText, queryValues });
    return await db.query<Postazione>(queryText, queryValues);
  }

  public static readonly getPostazioneByIdQueryText =
    "SELECT * FROM postazioni WHERE id = $1";

  public static async getPostazioneById(id: number) {
    const { rows } = await db.query<Postazione>(
      PostazioniDB.getPostazioneByIdQueryText,
      [id]
    );
    return rows[0];
  }

  public static async insertPostazione(postazione: BasePostazione) {
    return await db.insertRow<Postazione>("postazioni", postazione);
  }

  public static async deletePostazione(id: number) {
    return await db.deleteRows<Postazione>("postazioni", { id });
  }
}

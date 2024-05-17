import { BaseError } from "../types/errors.js";
import {
  GetProtocolliFilter,
  InsertProtocolloData,
} from "../utils/validation.js";
import * as db from "./index.js";
import { UploadedFile } from "express-fileupload";
import { FullProtocollo } from "../types/protocolli.js";
import ProtocolliFileManager from "../files/protocolli.js";

export default class ProtocolliDB {
  public static async getProtocolli(filter?: GetProtocolliFilter) {
    const prefixText = "SELECT * FROM full_protocolli";
    const filterText =
      filter &&
      Object.entries(filter)
        .filter(([, value]) => value)
        .map(([key, value], i) => {
          switch (key) {
            case "postazioneId":
              return `${i + 1}=ANY(visibile_da_id)`;
            case "postazioneName":
              return `${i + 1}=ANY(visibile_da_name)`;
            case "dataInizio":
              return `date>=${i + 1}`;
            case "dataFine":
              return `date<=${i + 1}`;
            default:
              return typeof value === "string"
                ? `${key} LIKE $${i + 1}`
                : `${key}=$${i + 1}`;
          }
        })
        .join(" AND ");

    const queryText = filterText
      ? [prefixText, filterText].join(" WHERE ")
      : prefixText;
    const queryValues =
      filter &&
      Object.entries(filter)
        .filter(([, value]) => value)
        .map(([key, value]) =>
          key.startsWith("data") === false && typeof value === "string"
            ? `%${value}%`
            : value
        );

    return await db.query<FullProtocollo>(queryText, queryValues);
  }

  public static async insertProtocollo(
    data: InsertProtocolloData,
    docs: UploadedFile[]
  ) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const insertProtRes = await client.query<{ id: number }>(
        "INSERT INTO protocolli (descrizione) VALUES ($1) RETURNING id",
        [data.descrizione]
      );
      if (insertProtRes.rowCount === 0) {
        throw new BaseError("Impossibile inserire protocollo");
      }

      const protId = insertProtRes.rows[0].id;
      const filenames = await ProtocolliFileManager.uploadDocs(protId, docs);
      const postazioniIds = data.visibileDa.filter((v) => v);

      // const docsValuesQuery = filenames.flatMap((filename) => [filename, protId]);
      // const docsTextQuery =
      //   "INSERT INTO documento (filename, prot_id) VALUES ".concat(
      //     docsValuesQuery
      //       .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
      //       .join(",")
      //   );
      const docsValuesQuery = [protId, ...filenames];
      const docsTextQuery =
        "INSERT INTO documento (filename, prot_id) VALUES ".concat(
          docsValuesQuery.map((_, i) => `($${i + 2}, $1)`).join(",")
        );
      const insertDocsRes = await client.query(docsTextQuery, docsValuesQuery);
      if (insertDocsRes.rowCount !== filenames.length) {
        throw new BaseError("Impossibile inserire documento/i", {
          context: {
            protId,
            filenames,
            expectedLength: filenames.length,
            actualLength: insertDocsRes.rowCount,
          },
        });
      }

      // const visibileDaValuesQuery = userIds.flatMap((userId) => [protId, userId]);
      // const visibileDaTextQuery =
      //   "INSERT INTO prot_visibile_da (prot_id, user_id) VALUES ($1, $2)".concat(
      //     visibileDaValuesQuery
      //       .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
      //       .join(",")
      //   );
      const visibileDaValuesQuery = [protId, ...postazioniIds];
      const visibileDaTextQuery =
        "INSERT INTO prot_visibile_da (protocollo, postazione) VALUES ".concat(
          visibileDaValuesQuery.map((_, i) => `($1, $${i + 2})`).join(",")
        );
      const insertVisibileDaRes = await client.query(
        visibileDaTextQuery,
        visibileDaValuesQuery
      );
      if (insertVisibileDaRes.rowCount !== postazioniIds.length) {
        throw new BaseError("Impossibile inserire in prot_visibile_da", {
          context: {
            protId,
            postazioniIds,
            expectedLength: postazioniIds.length,
            actualLength: insertVisibileDaRes.rowCount,
          },
        });
      }

      await client.query("COMMIT");

      return insertProtRes;
    } catch (e) {
      await client.query("ROLLBACK");

      if (
        e instanceof BaseError &&
        e.context &&
        typeof e.context === "object"
      ) {
        const protId = Number.parseInt(
          (e.context as Record<PropertyKey, any>)["protId"]
        );
        if (!Number.isNaN(protId)) {
          await ProtocolliFileManager.deleteDocs(protId);
        }
      }

      throw e;
    } finally {
      client.release();
    }
  }

  public static deleteProtocollo(id: number) {
    return db.query("DELETE FROM protocolli WHERE id = $1 RETURNING id", [id]);
  }
}

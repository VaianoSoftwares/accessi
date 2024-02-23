import { BaseError } from "../_types/errors.js";
import {
  GetProtocolliFilter,
  InsertProtocolloData,
} from "../utils/validation.js";
import * as db from "./index.js";
import * as FileManager from "../files/protocolli.js";
import { UploadedFile } from "express-fileupload";

export async function getProtocolli(filter?: GetProtocolliFilter) {
  const prefixText = "SELECT * FROM full_protocolli";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key], i) => {
        switch (key) {
          case "userId":
            return `${i + 1}=ANY(visibile_da_id)`;
          case "username":
            return `${i + 1}=ANY(visibile_da_name)`;
          case "dataInizio":
            return `date>=${i + 1}`;
          case "dataFine":
            return `date<=${i + 1}`;
          default:
            return `${key} LIKE %${i + 1}%`;
        }
      })
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, filterText].join(" WHERE ")
    : prefixText;
  const queryValues = filter && Object.values(filter).filter((value) => value);

  return await db.query(queryText, queryValues);
}

export async function insertProtocollo(
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
    if (insertProtRes.rowCount !== 1) {
      throw new BaseError("Impossibile inserire protocollo");
    }

    const protId = insertProtRes.rows[0].id;
    const filenames = await FileManager.uploadDocs(protId, docs);
    const userIds = data.visibileDa.filter((v) => v);

    const docsValuesQuery = filenames.flatMap((filename) => [filename, protId]);
    const docsTextQuery =
      "INSERT INTO documento (filename, prot_id) VALUES ".concat(
        docsValuesQuery
          .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
          .join(",")
      );
    const insertDocsRes = await client.query(docsTextQuery, docsValuesQuery);
    if (insertDocsRes.rowCount !== 1) {
      throw new BaseError("Impossibile inserire documento/i", {
        context: { protId, filenames },
      });
    }

    const visibileDaValuesQuery = userIds.flatMap((userId) => [protId, userId]);
    const visibileDaTextQuery =
      "INSERT INTO prot_visibile_da (prot_id, user_id) VALUES ($1, $2)".concat(
        visibileDaValuesQuery
          .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
          .join(",")
      );
    const insertVisibileDaRes = await client.query(
      visibileDaTextQuery,
      visibileDaValuesQuery
    );
    if (insertVisibileDaRes.rowCount !== 1) {
      throw new BaseError("Impossibile inserire in prot_visibile_da", {
        context: { protId, userIds },
      });
    }

    await client.query("COMMIT");

    return insertProtRes;
  } catch (e) {
    if (e instanceof BaseError && e.context && typeof e.context === "object") {
      const protId = Number.parseInt(
        (e.context as Record<PropertyKey, any>)["protId"]
      );
      if (!Number.isNaN(protId)) {
        await FileManager.deleteDocs(protId);
      }
    }
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export function deleteProtocollo(id: number) {
  return db.query("DELETE FROM protocolli WHERE id = $1 RETURNING id", [id]);
}

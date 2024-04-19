import * as db from "./index.js";
import { FindBadgesFilter, UpdateBadgeData } from "../utils/validation.js";
import {
  Badge,
  BadgeNominativo,
  ParsedInsertBadgeData,
} from "../types/badges.js";

export async function getBadges(filter?: FindBadgesFilter) {
  const prefixText = "SELECT * FROM badges";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([key, value]) => value && key !== "provvisorio")
      .map(([key, value], i) => {
        // if (key === "provvisorio" && value === true)
        //   return "is_provvisorio(codice)";
        return typeof value === "string"
          ? `${key} LIKE $${i + 1}`
          : `${key}=$${i + 1}`;
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

export async function insertBadge(data: ParsedInsertBadgeData) {
  return await db.insertRow("badges", data);
}

export async function updateBadge(data: UpdateBadgeData) {
  return await db.updateRows("badges", data.updateData, {
    codice: data.codice,
  });
}

export async function deleteBadge(codice: string) {
  return await db.deleteRows("badges", { codice });
}

export async function getBadgeByCodice(codice: string) {
  return await db.query<Badge>("SELECT * FROM badges WHERE codice = $1", [
    codice,
  ]);
}

export async function getBadgeNominativoByCodice(codice: string) {
  return await db.query<BadgeNominativo>(
    "SELECT * FROM badges JOIN people ON proprietario = id WHERE codice = $1",
    [codice]
  );
}

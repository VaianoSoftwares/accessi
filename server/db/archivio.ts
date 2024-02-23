import * as db from "./index.js";
import {
  Archivio,
  ArchivioChiave,
  ArchivioNominativo,
  ArchivioProvvisorio,
  ArchivioVeicolo,
  BaseArchivio,
  TimbraChiaviData,
  TimbraNomData,
  TimbraVeicoloData,
} from "../_types/archivio.js";
import { WithId } from "../_types/index.js";
import { BaseError } from "../_types/errors.js";
import { Nominativo } from "../_types/badges.js";
import {
  FindArchivioFilter,
  FindInPrestitoFilter,
  FindInStruttFilter,
  InsertArchProvData,
} from "../utils/validation.js";

export async function getArchivio(filter?: FindArchivioFilter) {
  const prefixText = "SELECT * FROM full_archivio";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key], i) => {
        switch (key) {
          case "tipo":
            return `(tipo='PROVVISORIO' OR tipo=${i + 1})`;
          case "data_in_min":
            return `data_in>=$${i + 1}`;
          case "data_in_max":
            return `data_in<=$${i + 1}`;
          case "data_out_min":
            return `data_out>=$${i + 1}`;
          case "data_out_max":
            return `data_out<=$${i + 1}`;
          default:
            return `${key} LIKE %${i + 1}%`;
        }
      })
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, filterText].join(" WHERE ")
    : prefixText;
  const queryValues = filter && Object.values(filter).filter((value) => value);

  return await db.query<Archivio>(queryText, queryValues);
}

export async function getInStrutt(filter?: FindInStruttFilter) {
  let i = 1;
  const prefixText =
    "SELECT codice, tipo, assegnazione, cliente, postazione, nome, cognome, ditta, data_in FROM in_strutt";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        switch (key) {
          case "tipi":
            return Array.isArray(value)
              ? ["(", value.map(() => `tipo=$${i++}`).join(" OR "), ")"].join(
                  ""
                )
              : "";
          case "postazioni":
            return Array.isArray(value)
              ? [
                  "(",
                  value.map(() => `postazione_id=$${i++}`).join(" OR "),
                  ")",
                ].join("")
              : "";
          case "data_in_min":
            return `data_in>=$${i++}`;
          case "data_in_max":
            return `data_in<=$${i++}`;
          default:
            return `${key} LIKE %${i++}%`;
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

  return await db.query<Archivio>(queryText, queryValues);
}

export async function getInPrestito(filter?: FindInPrestitoFilter) {
  let i = 1;
  const prefixText =
    "SELECT badge, chiave, cliente, postazione, assegnazione, nome, cognome, ditta, indirizzo, citta, edificio, piano, data_in FROM in_prestito";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        switch (key) {
          case "postazioni":
            return Array.isArray(value)
              ? [
                  "(",
                  value.map(() => `postazione_id=$${i++}`).join(" OR "),
                  ")",
                ].join("")
              : "";
          case "data_in_min":
            return `data_in>=$${i++}`;
          case "data_in_max":
            return `data_in<=$${i++}`;
          default:
            return `${key} LIKE %${i++}%`;
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

  return await db.query<ArchivioChiave>(queryText, queryValues);
}

async function getInStruttRowIdByBadge<T extends WithId<BaseArchivio>>(
  badge: string,
  tableName: string
) {
  const { rows, rowCount } = await db.query<T>(
    "SELECT * FROM $1 WHERE data_in IS NOT NULL AND data_out IS NULL AND badge = $2",
    [tableName, badge]
  );
  return rowCount === 0 ? null : rows[0].id;
}

async function setRowDateOut<T extends WithId<BaseArchivio>>(
  id: number,
  tableName: string
) {
  return await db.query<T>(
    "UPDATE $1 * SET data_out = DEFAULT WHERE id = $2 RETURNING *",
    [tableName, id]
  );
}

export async function timbraEntrataNominativo(data: TimbraNomData) {
  const id = await getInStruttRowIdByBadge(data.badge, "archivio_badge");
  if (id)
    throw new BaseError("Badge già presente in struttura", {
      status: 400,
      context: { badge: data.badge },
    });
  return await db.insertRow<ArchivioNominativo>("archivio_badge", data);
}

export async function timbraUscitaNominativo(badge: string) {
  const id = await getInStruttRowIdByBadge(badge, "archivio_badge");
  if (!id)
    throw new BaseError("Badge non presente in struttura", {
      status: 400,
      context: { badge },
    });
  return await setRowDateOut(id, "archivio_badge");
}

export async function timbraEntrataVeicolo(data: TimbraVeicoloData) {
  const id = await getInStruttRowIdByBadge(data.badge, "archivio_veicoli");
  if (id)
    throw new BaseError("Badge già presente in struttura", {
      status: 400,
      context: { badge: data.badge },
    });
  return await db.insertRow<ArchivioVeicolo>("archivio_veicoli", data);
}

export async function timbraUscitaVeicolo(badge: string) {
  const id = await getInStruttRowIdByBadge(badge, "archivio_veicoli");
  if (!id)
    throw new BaseError("Badge non presente in struttura", {
      status: 400,
      context: { badge },
    });
  return await setRowDateOut(id, "archivio_veicoli");
}

export async function insertProvvisorio(data: InsertArchProvData) {
  return await db.insertRow<ArchivioProvvisorio>("archivio_provvisori", data);
}

export async function timbraEntrataProvvisorio(badge: string) {
  const { rows, rowCount } = await db.query<ArchivioProvvisorio>(
    "SELECT * FROM archivio_provvisori WHERE data_in IS NULL AND data_out IS NULL AND badge = $1",
    [badge]
  );
  if (rowCount === 0)
    throw new BaseError("Badge Provvisorio non valido", {
      status: 400,
      context: { badge },
    });
  const { id } = rows[0];

  return await db.query<ArchivioProvvisorio>(
    "UPDATE archivio_provvisori * SET data_in = DEFAULT WHERE id = $1",
    [id]
  );
}

export async function timbraUscitaProvvisorio(badge: string) {
  const id = await getInStruttRowIdByBadge(badge, "archivio_provvisori");
  if (!id)
    throw new BaseError("Badge non presente in struttura", {
      status: 400,
      context: { badge },
    });
  return await setRowDateOut(id, "archivio_provvisori");
}

export async function timbraChiavi(data: TimbraChiaviData) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const existsBadge = await client.query<Nominativo>(
      "SELECT codice, stato FROM nominativi WHERE codice = $1",
      [data.badge]
    );
    if (existsBadge.rowCount !== 1) {
      throw new BaseError("Badge non valido", {
        status: 400,
        context: { badge: data.badge },
      });
    } else if (existsBadge.rows[0].stato !== "VALIDO") {
      throw new BaseError("Badge scaduto", {
        status: 400,
        context: { badge: data.badge },
      });
    }

    const findChiaviQueryText = [
      "SELECT codice FROM chiavi",
      data.chiavi.map((_, i) => `codice=$${i + 1}`).join(" OR "),
    ].join(" WHERE ");

    const existingChiavi = await client.query(findChiaviQueryText, data.chiavi);
    if (existingChiavi.rowCount !== data.chiavi.length) {
      throw new BaseError("Una o più chiavi non valide", {
        status: 400,
        context: { chiavi: data.chiavi },
      });
    }

    const { rows: chiaviInPrestito } = await client.query<{
      id: number;
      chiave: string;
    }>(
      "SELECT id, chiave FROM archivio_chiavi WHERE data_out IS NULL AND badge = $1",
      [data.badge]
    );

    const chiaviIn: string[] = [];
    const chiaviOut: number[] = [];
    data.chiavi.forEach((chiave) => {
      const id = chiaviInPrestito.find((row) => row.chiave === chiave)?.id;
      if (id) chiaviOut.push(id);
      else chiaviIn.push(chiave);
    });

    const chiaviInValues = chiaviIn.flatMap((chiave) => [
      data.badge,
      chiave,
      data.postazione,
      data.ip,
    ]);
    const chiaviInText = [
      "INSERT INTO archivio_chiavi (badge, chiave, postazione, ip) VALUES",
      chiaviInValues
        .map((_, i) => {
          switch (i % 4) {
            case 0:
              return `($${i + 1}`;
            case 3:
              return `$${i + 1})`;
            default:
              return `$${i + 1}`;
          }
        })
        .join(","),
      "RETURNING *",
    ].join(" ");
    const chiaviInRes = await client.query(chiaviInText, chiaviInValues);

    const chiaviOutText = [
      "UPDATE archivio_chiavi SET data_out = date_trunc('second', CURRENT_TIMESTAMP) WHERE",
      chiaviOut.map((_, i) => `id = $${i + 1}`).join(" OR "),
      "RETURNING *",
    ].join(" ");
    const chiaviOutRes = await client.query(chiaviOutText, chiaviOut);

    await client.query("COMMIT");

    return { in: chiaviInRes, out: chiaviOutRes };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

import * as db from "./index.js";
import {
  Archivio,
  ArchivioChiave,
  ArchivioNominativo,
  ArchivioProvvisorio,
  BaseArchivio,
  TimbraChiaviData,
  TimbraBadgeData,
  TimbraUniData,
  InStrutt,
  ArchivioVeicolo,
} from "../types/archivio.js";
import { WithId } from "../types/index.js";
import { BaseError } from "../types/errors.js";
import { Nominativo } from "../types/badges.js";
import {
  FindArchivioFilter,
  FindInPrestitoFilter,
  FindInStruttFilter,
  InsertArchProvData,
} from "../utils/validation.js";
import {
  getNominativoByCodice,
  getProvvisorioByCodice,
  getVeicoloByCodice,
} from "../db/badges.js";
import { getPostazioneById, getPostazioni } from "./postazioni.js";
import { Postazione } from "../types/users.js";

export async function getArchivio(filter?: FindArchivioFilter) {
  const prefixText = "SELECT * FROM full_archivio";
  const filterText =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value], i) => {
        switch (key) {
          case "data_in_min":
            return `data_in>=$${i + 1}`;
          case "data_in_max":
            return `data_in<=$${i + 1}`;
          case "data_out_min":
            return `data_out>=$${i + 1}`;
          case "data_out_max":
            return `data_out<=$${i + 1}`;
          default:
            return typeof value === "string"
              ? `${key} LIKE $${i + 1}`
              : `${key}=$${i + 1}`;
        }
      })
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, "WHERE", filterText, "ORDER BY data_in DESC, tipo"].join(" ")
    : [prefixText, "ORDER BY data_in DESC, tipo"].join(" ");
  const queryValues =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value]) =>
        key.includes("data") ? new Date(String(value)) : `%${value}%`
      );

  return await db.query<Archivio>(queryText, queryValues);
}

export async function getInStrutt(filter?: FindInStruttFilter) {
  let i = 1;
  const prefixText =
    "SELECT id, codice, tipo, assegnazione, cliente, postazione, nome, cognome, ditta, data_in FROM in_strutt";
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
            return typeof value === "string"
              ? `${key} LIKE $${i++}`
              : `${key}=$${i++}`;
        }
      })
      .join(" AND ");

  const queryText = filterText
    ? [prefixText, "WHERE", filterText, "ORDER BY data_in DESC, tipo"].join(" ")
    : [prefixText, "ORDER BY data_in DESC, tipo"].join(" ");
  const queryValues =
    filter &&
    Object.entries(filter)
      .filter(([, value]) => value)
      .map(([key, value]) =>
        key.includes("data") ? new Date(String(value)) : `%${value}%`
      )
      .flat();

  return await db.query<InStrutt>(queryText, queryValues);
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
            return typeof value === "string"
              ? `${key} LIKE $${i++}`
              : `${key}=$${i++}`;
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
        key.includes("data") ? new Date(String(value)) : `%${value}%`
      )
      .flat();

  return await db.query<ArchivioChiave>(queryText, queryValues);
}

async function setRowDateOut<T extends WithId<BaseArchivio>>(
  id: number,
  tableName: string
) {
  return await db.query<T>(
    `UPDATE ${tableName} * SET data_out = date_trunc('second', CURRENT_TIMESTAMP) WHERE id = $1 RETURNING *`,
    [id]
  );
}

export async function timbraEntrataNominativo(data: TimbraBadgeData) {
  const existsBadge = await getNominativoByCodice(data.badge);
  if (existsBadge.rowCount === 0) {
    throw new BaseError("Badge non esistente", {
      status: 400,
      context: { badge: data.badge },
    });
  }

  const { cliente: clienteBadge, scadenza, stato } = existsBadge.rows[0];

  const postazioneMark = await getPostazioneById(data.postazione);
  if (postazioneMark.cliente !== clienteBadge) {
    throw new BaseError("Impossibile timbrare badge di un altro cliente", {
      status: 400,
      context: {
        badge: data.badge,
        clienteBadge,
        clientePostazione: postazioneMark.cliente,
      },
    });
  } else if (stato !== "VALIDO") {
    throw new BaseError("Badge non valido", {
      status: 400,
      context: {
        badge: data.badge,
        stato,
      },
    });
  } else if (scadenza && new Date(scadenza) < new Date()) {
    throw new BaseError("Badge scaduto", {
      status: 400,
      context: {
        badge: data.badge,
        scadenza,
      },
    });
  }

  const { rowCount: numRowsInStrutt } = await getInStrutt({
    codice: data.badge,
  });
  if (numRowsInStrutt !== 0)
    throw new BaseError("Badge già presente in struttura", {
      status: 400,
      context: { badge: data.badge },
    });

  const { rows: insertedRows, rowCount: numRowsInserted } =
    await db.insertRow<ArchivioNominativo>("archivio_nominativi", data);
  if (numRowsInserted === 0) {
    throw new BaseError("Impossibile timbrare badge", {
      status: 500,
      context: { badge: data.badge },
    });
  }

  const { rows: inStruttRows } = await getInStrutt({ id: insertedRows[0].id });
  return { row: inStruttRows[0], isEntering: true };
}

export async function timbraUscitaNominativo(data: TimbraBadgeData) {
  const existsBadge = await getNominativoByCodice(data.badge);
  if (existsBadge.rowCount === 0) {
    throw new BaseError("Badge non esistente", {
      status: 400,
      context: { badge: data.badge },
    });
  }

  const { cliente: clienteBadge } = existsBadge.rows[0];

  const postazioneMark = await getPostazioneById(data.postazione);
  if (postazioneMark.cliente !== clienteBadge) {
    throw new BaseError("Impossibile timbrare badge di un altro cliente", {
      status: 400,
      context: {
        badge: data.badge,
        clienteBadge,
        clientePostazione: postazioneMark.cliente,
      },
    });
  }

  const { rows: inStruttRows, rowCount: numInStruttRows } = await getInStrutt({
    codice: data.badge,
  });
  if (numInStruttRows === 0)
    throw new BaseError("Badge non presente in struttura", {
      status: 400,
      context: { badge: data.badge },
    });

  const { rowCount: updatedRowsNum } = await setRowDateOut(
    inStruttRows[0].id,
    "archivio_nominativi"
  );
  if (updatedRowsNum === 0) {
    throw new BaseError("Impossibile timbrare badge", {
      status: 400,
      context: { id: inStruttRows[0].id, badge: data.badge },
    });
  }

  return { row: inStruttRows[0], isEntering: false };
}

export async function timbraEntrataVeicolo(data: TimbraBadgeData) {
  const existsBadge = await getVeicoloByCodice(data.badge);
  if (existsBadge.rowCount === 0) {
    throw new BaseError("Badge non esistente", {
      status: 400,
      context: { badge: data.badge },
    });
  }

  const { cliente: clienteBadge, stato } = existsBadge.rows[0];

  const postazioneMark = await getPostazioneById(data.postazione);
  if (postazioneMark.cliente !== clienteBadge) {
    throw new BaseError("Impossibile timbrare badge di un altro cliente", {
      status: 400,
      context: {
        badge: data.badge,
        clienteBadge,
        clientePostazione: postazioneMark.cliente,
      },
    });
  } else if (stato !== "VALIDO") {
    throw new BaseError("Badge non valido", {
      status: 400,
      context: {
        badge: data.badge,
        stato,
      },
    });
  }

  const { rowCount: numRowsInStrutt } = await getInStrutt({
    codice: data.badge,
  });
  if (numRowsInStrutt !== 0)
    throw new BaseError("Badge già presente in struttura", {
      status: 400,
      context: { badge: data.badge },
    });

  const { rows: insertedRows, rowCount: numRowsInserted } =
    await db.insertRow<ArchivioVeicolo>("archivio_veicoli", data);
  if (numRowsInserted === 0) {
    throw new BaseError("Impossibile timbrare badge", {
      status: 500,
      context: { badge: data.badge },
    });
  }

  const { rows: inStruttRows } = await getInStrutt({ id: insertedRows[0].id });
  return { row: inStruttRows[0], isEntering: true };
}

export async function timbraUscitaVeicolo(data: TimbraBadgeData) {
  const existsBadge = await getVeicoloByCodice(data.badge);
  if (existsBadge.rowCount === 0) {
    throw new BaseError("Badge non esistente", {
      status: 400,
      context: { badge: data.badge },
    });
  }

  const { cliente: clienteBadge } = existsBadge.rows[0];

  const postazioneMark = await getPostazioneById(data.postazione);
  if (postazioneMark.cliente !== clienteBadge) {
    throw new BaseError("Impossibile timbrare badge di un altro cliente", {
      status: 400,
      context: {
        badge: data.badge,
        clienteBadge,
        clientePostazione: postazioneMark.cliente,
      },
    });
  }

  const { rows: inStruttRows, rowCount: numInStruttRows } = await getInStrutt({
    codice: data.badge,
  });
  if (numInStruttRows === 0)
    throw new BaseError("Badge non presente in struttura", {
      status: 400,
      context: { badge: data.badge },
    });

  const { rowCount: updatedRowsNum } = await setRowDateOut(
    inStruttRows[0].id,
    "archivio_veicoli"
  );
  if (updatedRowsNum === 0) {
    throw new BaseError("Impossibile timbrare badge", {
      status: 400,
      context: { id: inStruttRows[0].id, badge: data.badge },
    });
  }

  return { row: inStruttRows[0], isEntering: false };
}

export async function insertProvvisorio(data: InsertArchProvData) {
  return await db.insertRow<ArchivioProvvisorio>("archivio_provvisori", data);
}

export async function timbraEntrataProvvisorio(data: TimbraBadgeData) {
  const existsBadge = await getProvvisorioByCodice(data.badge);
  if (existsBadge.rowCount === 0) {
    throw new BaseError("Badge non esistente", {
      status: 400,
      context: { badge: data.badge },
    });
  }

  const { cliente: clienteBadge } = existsBadge.rows[0];

  const postazioneMark = await getPostazioneById(data.postazione);
  if (postazioneMark.cliente !== clienteBadge) {
    throw new BaseError("Impossibile timbrare badge di un altro cliente", {
      status: 400,
      context: {
        badge: data.badge,
        clienteBadge,
        clientePostazione: postazioneMark.cliente,
      },
    });
  }

  const { rows: rowsInStrutt, rowCount: numRowsInStrutt } =
    await db.query<ArchivioProvvisorio>(
      "SELECT * FROM archivio_provvisori WHERE data_in > date_trunc('second', CURRENT_TIMESTAMP) AND badge = $1",
      [data.badge]
    );
  if (numRowsInStrutt === 0)
    throw new BaseError("Badge Provvisorio non valido", {
      status: 400,
      context: { badge: data.badge },
    });

  const { id } = rowsInStrutt[0];

  const { rows: updatedRows, rowCount: numRowsUpdated } =
    await db.query<ArchivioProvvisorio>(
      "UPDATE archivio_provvisori * SET data_in = date_trunc('second', CURRENT_TIMESTAMP) WHERE id = $1 RETURNING data_in",
      [id]
    );
  if (numRowsUpdated === 0) {
    throw new BaseError("Impossibile timbrare badge", {
      status: 500,
      context: { id: rowsInStrutt[0].id, badge: data.badge },
    });
  }

  const resRow = { ...rowsInStrutt[0], data_in: updatedRows[0].data_in };
  return { row: resRow, isEntering: true };
}

export async function timbraUscitaProvvisorio(data: TimbraBadgeData) {
  const existsBadge = await getProvvisorioByCodice(data.badge);
  if (existsBadge.rowCount === 0) {
    throw new BaseError("Badge non esistente", {
      status: 400,
      context: { badge: data.badge },
    });
  }

  const { cliente: clienteBadge } = existsBadge.rows[0];

  const postazioneMark = await getPostazioneById(data.postazione);
  if (postazioneMark.cliente !== clienteBadge) {
    throw new BaseError("Impossibile timbrare badge di un altro cliente", {
      status: 400,
      context: {
        badge: data.badge,
        clienteBadge,
        clientePostazione: postazioneMark.cliente,
      },
    });
  }

  const { rows: inStruttRows, rowCount: numInStruttRow } = await getInStrutt({
    codice: data.badge,
  });
  if (numInStruttRow === 0) {
    throw new BaseError("Badge non presente in struttura", {
      status: 400,
      context: { badge: data.badge },
    });
  }

  const { rowCount: numUpdatedRows } = await setRowDateOut(
    inStruttRows[0].id,
    "archivio_provvisori"
  );
  if (numUpdatedRows === 0) {
    throw new BaseError("Impossibile timbrare badge", {
      status: 400,
      context: { id: inStruttRows[0].id, badge: data.badge },
    });
  }

  return { row: inStruttRows[0], isEntering: false };
}

export async function timbraUniversitario(data: TimbraUniData) {
  const { rows: inStruttRows, rowCount: numInStruttRows } =
    await db.query<Archivio>(
      "SELECT * FROM in_strutt WHERE tipo = 'PROVVISORIO' AND ndoc = $1",
      [data.ndoc]
    );

  if (numInStruttRows !== 0) {
    const { rows, rowCount } = await getPostazioni({
      ids: [data.postazione, inStruttRows[0].postazione],
    });
    if (!rowCount || rowCount < 2) {
      throw new BaseError("Impossibile reperire postazioni", {
        status: 500,
        context: {
          badge: data.ndoc,
          postazioniId: [[data.postazione, inStruttRows[0].postazione]],
        },
      });
    } else if (rows[0].cliente !== rows[1].cliente) {
      throw new BaseError("Impossibile timbrare badge di un altro cliente", {
        status: 400,
        context: {
          badge: data.ndoc,
          clienti: JSON.stringify(rows),
        },
      });
    } else {
      const { rowCount: numUpdatedRows } = await setRowDateOut(
        inStruttRows[0].id,
        "archivio_provvisori"
      );
      if (numUpdatedRows === 0) {
        throw new BaseError("Impossibile timbrare badge", {
          status: 500,
          context: { id: inStruttRows[0].id, badge: data.ndoc },
        });
      }

      return { row: inStruttRows[0], isEntrata: false };
    }
  } else {
    const queryValues = Object.values(data).filter((v) => v);
    const { rowCount: numInsertedRows } = await db.insertRow(
      "archivio_provvisori",
      queryValues
    );
    if (numInsertedRows === 0) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 500,
        context: { badge: data.ndoc },
      });
    }

    const { rows: inStruttRows, rowCount: numInStruttRows } =
      await db.query<Archivio>(
        "SELECT * FROM in_strutt WHERE tipo = 'PROVVISORIO' AND ndoc = $1",
        [data.ndoc]
      );
    if (numInStruttRows === 0) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 500,
        context: { badge: data.ndoc },
      });
    }

    return { row: inStruttRows[0], isEntrata: true };
  }
}

export async function timbraChiavi(data: TimbraChiaviData) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const { rows: postazioniRows, rowCount: numPostazioniRows } =
      await client.query<Postazione>("SELECT * FROM postazioni WHERE id = $1", [
        data.postazione,
      ]);
    if (numPostazioniRows === 0) {
      throw new BaseError("Postazione non valida", {
        status: 400,
        context: { postazione: data.postazione },
      });
    }

    const existsBadge = await client.query<Nominativo>(
      "SELECT * FROM nominativi WHERE codice = $1",
      [data.badge]
    );
    if (existsBadge.rowCount === 0) {
      throw new BaseError("Badge non valido", {
        status: 400,
        context: { badge: data.badge },
      });
    }

    const badge = existsBadge.rows[0];
    const { cliente } = postazioniRows[0];

    if (badge.cliente !== cliente) {
      throw new BaseError("Impossibile timbrare badge di un altro cliente", {
        status: 400,
        context: { codice: badge.codice, cliente: badge.cliente },
      });
    } else if (badge.stato !== "VALIDO") {
      throw new BaseError("Badge non valido", {
        status: 400,
        context: { codice: badge.codice, stato: badge.stato },
      });
    } else if (
      existsBadge.rows[0].scadenza &&
      new Date(existsBadge.rows[0].scadenza) < new Date()
    ) {
      throw new BaseError("Badge scaduto", {
        status: 400,
        context: { codice: badge.codice, scadenza: badge.scadenza },
      });
    }

    const findChiaviQueryText = [
      "SELECT * FROM chiavi WHERE cliente = $1",
      data.chiavi.map((_, i) => `codice=$${i + 2}`).join(" OR "),
    ].join(" AND ");
    const existingChiavi = await client.query<ArchivioChiave>(
      findChiaviQueryText,
      [cliente, ...data.chiavi]
    );
    if (existingChiavi.rowCount !== data.chiavi.length) {
      throw new BaseError("Una o più chiavi non valide", {
        status: 400,
        context: {
          chiavi: data.chiavi,
          expectedLength: data.chiavi.length,
          actualLength: existingChiavi.rowCount,
        },
      });
    }

    const { rows: chiaviInPrestito } = await client.query<{
      id: number;
      chiave: string;
    }>(
      "SELECT id, chiave FROM archivio_chiavi WHERE data_out > date_trunc('second', CURRENT_TIMESTAMP) AND badge = $1",
      [data.badge, cliente]
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

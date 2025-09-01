import * as db from "./index.js";
import {
  Archivio,
  ArchivioChiave,
  BaseArchivio,
  ArchivioVeicolo,
  BadgeInStrutt,
  VeicoloInStrutt,
  FullVeicoloInStrutt,
  FullBadgeInStrutt,
  TimbraChiaviData,
  ArchivioVeicoloProv,
  ArchivioNominativo,
  ArchivioProvvisorio,
  Tracciato,
  TimbraChiaviProvData,
  TimbraChiaviNoBadgeData,
  MarkType,
} from "../types/archivio.js";
import { BaseError } from "../types/errors.js";
import {
  FindArchivioFilter,
  FindInPrestitoFilter,
  FindInStruttBadgesFilter,
  FindInStruttVeicoliFilter,
  GetResocontoFilter,
  InsertArchBadgeData,
  InsertArchVeicoloData,
  TimbraBadgeData,
  TimbraVeicoloData,
  UpdateArchivioData,
} from "../utils/validation.js";
import PostazioniDB from "./postazioni.js";
import { Postazione } from "../types/users.js";
import VeicoliDB from "./veicoli.js";
import { WithId } from "../types/index.js";
import NominativiDB from "./nominativi.js";
import ProvvisoriDB from "./provvisori.js";
import {
  BadgeState,
  Nominativo,
  Person,
  Provvisorio,
} from "../types/badges.js";

enum ArchTableName {
  NOMINATIVI = "archivio_nominativi",
  PROVVISORI = "archivio_provvisori",
  CHIAVI = "archivio_chiavi",
  CHIAVI_PROV = "archivio_chiavi_prov",
  VEICOLI = "archivio_veicoli",
  VEICOLI_PROV = "archivio_veicoli_prov",
  BADGES_IN_STRUTT = "in_strutt_badges",
  VEICOLI_IN_STRUTT = "in_strutt_veicoli",
  IN_PRESTITO = "in_prestito",
  FULL_BADGES_IN_STRUTT = "full_in_strutt_badges",
  FULL_VEICOLI_IN_STRUTT = "full_in_strutt_veicoli",
  FULL_IN_PRESTITO = "full_in_prestito",
  FULL_ARCHIVIO = "full_archivio",
}

export default class ArchivioDB {
  public static async getArchivio(filter?: FindArchivioFilter) {
    const prefixText = "SELECT * FROM full_archivio";
    const filterText =
      filter &&
      Object.entries(filter)
        .filter(([, value]) => value)
        .map(([key, value], i) => {
          switch (key) {
            case "date_min":
              return `created_at>=$${i + 1}`;
            case "date_max":
              return `created_at<=$${i + 1}`;
            case "data_out_min":
              return `created_at>=$${i + 1}`;
            case "data_out_max":
              return `created_at<=$${i + 1}`;
            case "post_ids":
              return `(${(value as any[])
                .map((_) => `post_id=$${i + 1}`)
                .join(" OR ")})`;
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
        .flatMap((value) => (typeof value !== "string" ? value : `%${value}%`));

    return await db.query<Archivio>(queryText, queryValues);
  }

  public static async getBadgesInStrutt(filter?: FindInStruttBadgesFilter) {
    let i = 1;
    const prefixText = `SELECT id, codice, descrizione, pausa, assegnazione, cliente, postazione, nome, cognome, ditta, created_at FROM ${ArchTableName.FULL_BADGES_IN_STRUTT}`;
    let filterText = filter
      ? Object.entries(filter)
          .filter(([key, value]) => value && !["pausa"].includes(key))
          .map(([key, value]) => {
            switch (key) {
              case "postazioniIds":
                if (!Array.isArray(value)) return "";
                const postazioniFilters = value.map(() => `post_id=$${i++}`);
                if (filter?.pausa === true)
                  postazioniFilters.push(`(mark_type='${MarkType.pauseIn}')`);
                return ["(", postazioniFilters.join(" OR "), ")"].join("");
              case "date_min":
                return `created_at>=$${i++}`;
              case "date_max":
                return `created_at<=$${i++}`;
              case "cliente":
                return `${key}=$${i++}`;
              default:
                return typeof value === "string"
                  ? `${key} LIKE $${i++}`
                  : `${key}=$${i++}`;
            }
          })
          .join(" AND ")
      : "";

    if (filter?.pausa === undefined || filter?.pausa === false) {
      const pauseFilter = `(mark_type!='${MarkType.pauseIn}')`; 
      filterText = filterText
        ? [filterText, pauseFilter].join(" AND ")
        : pauseFilter;
    }

    const queryText = filterText
      ? [prefixText, "WHERE", filterText].join(" ")
      : prefixText;
    const queryValues =
      filter &&
      Object.entries(filter)
        .filter(([key, value]) => value && !["pausa"].includes(key))
        .map(([key, value]) =>
          Array.isArray(value) ||
          typeof value !== "string" ||
          ["cliente"].includes(key)
            ? value
            : `%${value}%`
        )
        .flat();

    return await db.query<BadgeInStrutt>(queryText, queryValues);
  }

  public static async getVeicoliInStrutt(filter?: FindInStruttVeicoliFilter) {
    let i = 1;
    const prefixText = `SELECT id, targa, descrizione, tveicolo, assegnazione, cliente, postazione, nome, cognome, ditta, created_at FROM ${ArchTableName.FULL_VEICOLI_IN_STRUTT}`;
    const filterText =
      filter &&
      Object.entries(filter)
        .filter(([, value]) => value)
        .map(([key, value]) => {
          switch (key) {
            case "postazioniIds":
              return Array.isArray(value)
                ? [
                    "(",
                    value.map(() => `post_id=$${i++}`).join(" OR "),
                    ")",
                  ].join("")
                : "";
            case "date_min":
              return `created_at>=$${i++}`;
            case "date_max":
              return `created_at<=$${i++}`;
            default:
              return typeof value === "string"
                ? `${key} LIKE $${i++}`
                : `${key}=$${i++}`;
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
        .map((value) =>
          Array.isArray(value) || typeof value !== "string"
            ? value
            : `%${value}%`
        )
        .flat();

    return await db.query<VeicoloInStrutt>(queryText, queryValues);
  }

  public static async getInPrestito(filter?: FindInPrestitoFilter) {
    let i = 1;
    const prefixText = `SELECT badge, chiave, cliente, postazione, assegnazione, nome, cognome, ditta, indirizzo, citta, edificio, piano, created_at FROM ${ArchTableName.FULL_IN_PRESTITO}`;
    const filterText =
      filter &&
      Object.entries(filter)
        .filter(([, value]) => value)
        .map(([key, value]) => {
          switch (key) {
            case "postazioniIds":
              return Array.isArray(value)
                ? [
                    "(",
                    value.map(() => `post_id=$${i++}`).join(" OR "),
                    ")",
                  ].join("")
                : "";
            case "data_in_min":
              return `created_at>=$${i++}`;
            case "data_in_max":
              return `created_at<=$${i++}`;
            default:
              return typeof value === "string"
                ? `${key} LIKE $${i++}`
                : `${key}=$${i++}`;
          }
        })
        .join(" AND ");

    const queryText = filterText
      ? [prefixText, "WHERE", filterText, "ORDER BY created_at DESC"].join(" ")
      : [prefixText, "ORDER BY created_at DESC"].join(" ");
    const queryValues =
      filter &&
      Object.values(filter)
        .filter((value) => value)
        .map((value) =>
          Array.isArray(value) || typeof value !== "string"
            ? value
            : `%${value}%`
        )
        .flat();

    return await db.query<ArchivioChiave>(queryText, queryValues);
  }

  private static async setArchRowDate<T extends WithId<BaseArchivio>>(
    id: number,
    tableName: string,
    inOrOut: "in" | "out"
  ) {
    return await db.query<T>(
      `UPDATE ${tableName} SET data_${inOrOut} = CURRENT_TIMESTAMP(0) WHERE id = $1 RETURNING id`,
      [id]
    );
  }

  public static async timbraNominativoIn(data: TimbraBadgeData) {
    const badgeCode = data.badge_cod;
    const existsBadge = await NominativiDB.getNominativoByCodice(badgeCode);
    if (!existsBadge.rowCount) {
      throw new BaseError("Badge non esistente", {
        status: 400,
        context: { badgeCode },
      });
    }

    const { cliente: expectedCliente, stato, scadenza } = existsBadge.rows[0];

    const postazioneMark = await PostazioniDB.getPostazioneById(data.post_id);
    if (postazioneMark.cliente !== expectedCliente) {
      throw new BaseError("Impossibile timbrare badge di un altro cliente", {
        status: 400,
        context: {
          badgeCode,
          expectedCliente,
          actualCliente: postazioneMark.cliente,
        },
      });
    } else if (stato !== BadgeState.VALIDO) {
      throw new BaseError("Badge non valido", {
        status: 400,
        context: {
          badgeCode,
          stato,
        },
      });
    } else if (scadenza && new Date(scadenza) < new Date()) {
      throw new BaseError("Privacy scaduta", {
        status: 400,
        context: {
          badgeCode,
          scadenza,
        },
      });
    }

    const { rowCount: numRowsInStrutt } = await ArchivioDB.getBadgesInStrutt({
      codice: badgeCode,
      pausa: true,
    });
    if (numRowsInStrutt)
      throw new BaseError("Badge già presente in struttura", {
        status: 400,
        context: { badgeCode },
      });

    const { rows: insertedRows, rowCount: numRowsInserted } =
      await db.insertRow<ArchivioNominativo>(ArchTableName.NOMINATIVI, {
        ...data,
        mark_type: MarkType.in,
      });
    if (!numRowsInserted) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 500,
        context: { badgeCode },
      });
    }

    const archId = insertedRows[0].id;
    const { rowCount: numInStruttRows, rows: inStruttRows } =
      await ArchivioDB.getBadgesInStrutt({ id: archId });
    if (!numInStruttRows) {
      throw new BaseError("Impossibile reperire badge in struttura", {
        status: 500,
        context: { archId, badgeCode },
      });
    }
    return { row: inStruttRows[0], isEntering: true };
  }

  public static async timbraNominativoOut(data: TimbraBadgeData) {
    const badgeCode = data.badge_cod;
    const existsBadge = await NominativiDB.getNominativoByCodice(badgeCode);
    if (!existsBadge.rowCount) {
      throw new BaseError("Badge non esistente", {
        status: 400,
        context: { badgeCode },
      });
    }

    const { cliente: expectedCliente } = existsBadge.rows[0];
    const postazioneMark = await PostazioniDB.getPostazioneById(data.post_id);
    if (postazioneMark.cliente !== expectedCliente) {
      throw new BaseError("Impossibile timbrare badge di un altro cliente", {
        status: 400,
        context: {
          badgeCode,
          expectedCliente,
          actualCliente: postazioneMark.cliente,
        },
      });
    }

    const { rows: fullInStruttRows, rowCount: numFullInStruttRows } =
      await db.query<FullBadgeInStrutt>(
        `SELECT * FROM ${ArchTableName.FULL_BADGES_IN_STRUTT} WHERE codice = $1`,
        [badgeCode]
      );
    if (!numFullInStruttRows) {
      throw new BaseError("Badge non presente in struttura", {
        status: 400,
        context: { badgeCode },
      });
    } else if (data.post_id != fullInStruttRows[0].post_id) {
      throw new BaseError("Impossibile timbrare badge da questa postazione", {
        status: 400,
        context: {
          badgeCode,
          expectedPostazione: fullInStruttRows[0].post_id,
          actualPostazione: data.post_id,
        },
      });
    }

    const recordIdIn = fullInStruttRows[0].id;
    const { rowCount: numInStruttRows, rows: inStruttRows } =
      await ArchivioDB.getBadgesInStrutt({ id: recordIdIn });
    if (!numInStruttRows) {
      throw new BaseError("Impossibile reperire badge in struttura", {
        status: 500,
        context: { recordIdIn, badgeCode },
      });
    }

    const { rowCount: numRowsInserted } =
      await db.insertRow<ArchivioNominativo>(ArchTableName.NOMINATIVI, {
        ...data,
        mark_type: MarkType.out,
      });
    if (!numRowsInserted) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 500,
        context: { badgeCode },
      });
    }

    return { row: inStruttRows[0], isEntering: false };
  }

  public static async timbraProvvisorioIn(data: TimbraBadgeData) {
    const badgeCode = data.badge_cod;
    const existsBadge = await ProvvisoriDB.getProvvisorioByCodice(badgeCode);
    if (!existsBadge.rowCount) {
      throw new BaseError("Badge non esistente", {
        status: 400,
        context: { badgeCode },
      });
    }

    const { cliente: expectedCliente, stato } = existsBadge.rows[0];

    const postazioneMark = await PostazioniDB.getPostazioneById(data.post_id);
    if (postazioneMark.cliente !== expectedCliente) {
      throw new BaseError("Impossibile timbrare badge di un altro cliente", {
        status: 400,
        context: {
          badgeCode,
          expectedCliente,
          actualCliente: postazioneMark.cliente,
        },
      });
    } else if (stato !== BadgeState.VALIDO) {
      throw new BaseError("Badge non valido", {
        status: 400,
        context: {
          badgeCode,
          stato,
        },
      });
    }

    const { rowCount: numArchRows, rows: archRows } =
      await db.query<ArchivioProvvisorio>(
        `SELECT * FROM ${ArchTableName.PROVVISORI} WHERE badge_cod = $1 ORDER BY created_at DESC LIMIT 1`,
        [badgeCode]
      );
    if (!numArchRows || archRows[0].mark_type !== MarkType.in) {
      throw new BaseError("Inserire il badge provvisorio prima di timbrare", {
        status: 400,
        context: { badgeCode },
      });
    } else if (archRows[0].created_at !== null) {
      throw new BaseError("Badge già presente in struttura", {
        status: 400,
        context: { badgeCode },
      });
    }

    const archId = archRows[0].id;
    const createdAt = data.created_at || new Date();

    const { rowCount: numUpdatedRows } = await db.query(
      `UPDATE ${ArchTableName.PROVVISORI} SET created_at = $1 WHERE id = $2`,
      [createdAt, archId]
    );
    if (!numUpdatedRows) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 500,
        context: { badgeCode, archId },
      });
    }

    const { rowCount: numInStruttRows, rows: inStruttRows } =
      await ArchivioDB.getBadgesInStrutt({
        id: archId,
      });
    if (!numInStruttRows) {
      throw new BaseError("Impossibile reperire badge in struttura", {
        status: 500,
        context: { archId, badgeCode },
      });
    }
    return { row: inStruttRows[0], isEntering: true };
  }

  public static async timbraProvvisorioOut(data: TimbraBadgeData) {
    const badgeCode = data.badge_cod;
    const existsBadge = await ProvvisoriDB.getProvvisorioByCodice(badgeCode);
    if (!existsBadge.rowCount) {
      throw new BaseError("Badge non esistente", {
        status: 400,
        context: { badgeCode },
      });
    }

    const { cliente: expectedCliente } = existsBadge.rows[0];
    const postazioneMark = await PostazioniDB.getPostazioneById(data.post_id);
    if (postazioneMark.cliente !== expectedCliente) {
      throw new BaseError("Impossibile timbrare badge di un altro cliente", {
        status: 400,
        context: {
          badgeCode,
          expectedCliente,
          actualCliente: postazioneMark.cliente,
        },
      });
    }

    const { rows: fullInStruttRows, rowCount: numFullInStruttRows } =
      await db.query<FullBadgeInStrutt>(
        `SELECT * FROM ${ArchTableName.FULL_BADGES_IN_STRUTT} WHERE codice = $1`,
        [badgeCode]
      );
    if (!numFullInStruttRows) {
      throw new BaseError("Badge non presente in struttura", {
        status: 400,
        context: { badgeCode },
      });
    } else if (data.post_id != fullInStruttRows[0].post_id) {
      throw new BaseError("Impossibile timbrare badge da questa postazione", {
        status: 400,
        context: {
          badgeCode,
          expectedPostazione: fullInStruttRows[0].post_id,
          actualPostazione: data.post_id,
        },
      });
    }

    const archId = fullInStruttRows[0].id;

    const { rowCount: numInStruttRows, rows: inStruttRows } =
      await ArchivioDB.getBadgesInStrutt({ id: archId });
    if (!numInStruttRows) {
      throw new BaseError("Impossibile reperire badge in struttura", {
        status: 500,
        context: { archId, badgeCode },
      });
    }

    const { rowCount: numInsertedRows } = await db.insertRow(
      ArchTableName.PROVVISORI,
      {
        ...data,
        mark_type: MarkType.out,
        created_at: data.created_at || new Date(),
      }
    );
    if (!numInsertedRows) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 400,
        context: { archId, badgeCode },
      });
    }

    return { row: inStruttRows[0], isEntering: false };
  }

  public static async timbraVeicolo(data: TimbraVeicoloData) {
    const existsVeicolo = await VeicoliDB.getVeicoloByTarga(data.targa);
    if (!existsVeicolo.rowCount) {
      throw new BaseError("Veicolo non esistente", {
        status: 400,
        context: { targa: data.targa },
      });
    }

    const { cliente: expectedCliente, stato, targa } = existsVeicolo.rows[0];

    const postazioneMark = await PostazioniDB.getPostazioneById(data.post_id);
    if (postazioneMark.cliente !== expectedCliente) {
      throw new BaseError("Impossibile timbrare veicolo da un altro cliente", {
        status: 400,
        context: {
          targa,
          expectedCliente,
          actualCliente: postazioneMark.cliente,
        },
      });
    }

    const { rowCount: numFullinStruttRows, rows: fullInStruttRows } =
      await db.query<FullVeicoloInStrutt>(
        `SELECT * FROM ${ArchTableName.FULL_VEICOLI_IN_STRUTT} WHERE targa = $1`,
        [targa]
      );
    if (!numFullinStruttRows) {
      if (stato !== BadgeState.VALIDO) {
        throw new BaseError("Veicolo non valido", {
          status: 400,
          context: {
            targa,
            stato,
          },
        });
      }

      const { rowCount: numInsertedRows, rows: insertedRows } =
        await db.insertRow(ArchTableName.VEICOLI, data);
      if (!numInsertedRows) {
        throw new BaseError("Impossibile timbrare veicolo", {
          status: 400,
          context: { targa },
        });
      }

      const archId = insertedRows[0].id;
      const { rowCount: numInStruttRows, rows: inStruttRows } =
        await ArchivioDB.getVeicoliInStrutt({
          id: archId,
        });
      if (!numInStruttRows) {
        throw new BaseError("Impossibile reperire veicolo in struttura", {
          status: 500,
          context: { archId, targa },
        });
      }
      return { row: inStruttRows[0], isEntering: true };
    } else {
      const archId = fullInStruttRows[0].id;

      if (data.post_id != fullInStruttRows[0].post_id) {
        throw new BaseError(
          "Impossibile timbrare veicolo da questa postazione",
          {
            status: 400,
            context: {
              archId,
              targa,
              expectedPostazione: fullInStruttRows[0].post_id,
              actualPostazione: data.post_id,
            },
          }
        );
      }

      const { rowCount: updatedRowsNum } = await ArchivioDB.setArchRowDate(
        archId,
        ArchTableName.VEICOLI,
        "out"
      );
      if (!updatedRowsNum) {
        throw new BaseError("Impossibile timbrare veicolo", {
          status: 400,
          context: { archId, targa },
        });
      }

      const { rowCount: numInStruttRows, rows: inStruttRows } =
        await ArchivioDB.getVeicoliInStrutt({
          id: archId,
        });
      if (!numInStruttRows) {
        throw new BaseError("Impossibile reperire veicolo in struttura", {
          status: 500,
          context: { archId, targa },
        });
      }

      // await db.query(
      //   `CALL mark_out(${archId}, \'\"${ArchTableName.VEICOLI}\"\')`
      // );

      return { row: inStruttRows[0], isEntering: false };
    }
  }

  public static async timbraVeicoloProv(data: TimbraVeicoloData) {
    const { rowCount: numFullInStruttRows, rows: fullInStruttRows } =
      await db.query<FullVeicoloInStrutt>(
        `SELECT * FROM ${ArchTableName.FULL_VEICOLI_IN_STRUTT} WHERE targa = $1`,
        [data.targa]
      );
    if (!numFullInStruttRows) {
      const { rows: insertedRows, rowCount: numRowsInserted } =
        await db.insertRow<ArchivioVeicolo>(ArchTableName.VEICOLI_PROV, data);
      if (!numRowsInserted) {
        throw new BaseError("Impossibile timbrare veicolo", {
          status: 500,
          context: { targa: data.targa },
        });
      }

      const archId = insertedRows[0].id;
      const { rowCount: numInStruttRows, rows: inStruttRows } =
        await ArchivioDB.getVeicoliInStrutt({
          id: archId,
        });
      if (!numInStruttRows) {
        throw new BaseError("Impossibile reperire veicolo in struttura", {
          status: 500,
          context: { archId, targa: data.targa },
        });
      }
      return { row: inStruttRows[0], isEntering: true };
    } else {
      const archId = fullInStruttRows[0].id;

      if (data.post_id != fullInStruttRows[0].post_id) {
        throw new BaseError(
          "Impossibile timbrare veicolo da questa postazione",
          {
            status: 400,
            context: {
              archId,
              targa: data.targa,
              expectedPostazione: fullInStruttRows[0].post_id,
              actualPostazione: data.post_id,
            },
          }
        );
      }

      const { rowCount: updatedRowsNum, rows: updatedRows } =
        await ArchivioDB.setArchRowDate(
          archId,
          ArchTableName.VEICOLI_PROV,
          "out"
        );
      if (!updatedRowsNum) {
        throw new BaseError("Impossibile timbrare veicolo", {
          status: 400,
          context: { archId, targa: data.targa },
        });
      }

      const { rowCount: numInStruttRows, rows: inStruttRows } =
        await ArchivioDB.getVeicoliInStrutt({
          id: archId,
        });
      if (!numInStruttRows) {
        throw new BaseError("Impossibile reperire veicolo in struttura", {
          status: 500,
          context: { archId, targa: data.targa },
        });
      }

      // await db.query(
      //   `CALL mark_out(${archId}, \'\"${ArchTableName.VEICOLI_PROV}\"\')`
      // );

      return { row: inStruttRows[0], isEntering: false };
    }
  }

  public static async insertBadgeProvvisorio(data: InsertArchBadgeData) {
    const client = await db.getClient();

    try {
      const badgeCode = data.badge_cod;

      const { rows: postazioniRows, rowCount: numPostazioniRows } =
        await client.query<Postazione>(
          PostazioniDB.getPostazioneByIdQueryText,
          [data.post_id]
        );
      if (!numPostazioniRows) {
        throw new BaseError("Postazione non valida", {
          status: 400,
          context: { badgeCode, postazioneId: data.post_id },
        });
      }

      const existsBadge = await client.query<Provvisorio>(
        ProvvisoriDB.getProvvisorioByCodiceQueryText,
        [badgeCode]
      );
      if (!existsBadge.rowCount) {
        throw new BaseError("Badge provvisorio non esistente", {
          status: 400,
          context: { badgeCode },
        });
      }

      const { cliente: actualCliente, stato } = existsBadge.rows[0];
      const { cliente: expectedCliente } = postazioniRows[0];

      if (stato !== BadgeState.VALIDO) {
        throw new BaseError("Badge Provvisorio non valido", {
          status: 400,
          context: { badgeCode, stato },
        });
      } else if (actualCliente != expectedCliente) {
        throw new BaseError(
          "Impossibile inserire Badge Provvisorio da un altro cliente",
          {
            status: 400,
            context: { badgeCode, actualCliente, expectedCliente },
          }
        );
      }

      const { rowCount: numFullInStruttRows } =
        await client.query<FullBadgeInStrutt>(
          `SELECT * FROM ${ArchTableName.PROVVISORI} WHERE badge_cod = $1 AND created_at IS NULL`,
          [badgeCode]
        );
      if (numFullInStruttRows) {
        throw new BaseError("Badge Provvisorio già inserito", {
          status: 400,
          context: { badgeCode },
        });
      }

      const existsPerson = await client.query<Person>(
        "SELECT * FROM people WHERE cliente = $1 AND (cod_fisc = $2 OR (tdoc = $3 AND ndoc = $4) OR (nome = $5 AND cognome = $6)) LIMIT 1",
        [
          actualCliente,
          data.cod_fisc,
          data.tdoc,
          data.ndoc,
          data.nome,
          data.cognome,
        ]
      );

      let personId: number;
      if (!existsPerson.rowCount) {
        const { queryText, queryValues } = db.getInsertRowQuery("people", {
          cliente: actualCliente,
          cod_fisc: data.cod_fisc,
          tdoc: data.tdoc,
          ndoc: data.ndoc,
          nome: data.nome,
          cognome: data.cognome,
          assegnazione: data.assegnazione,
          ditta: data.ditta,
          telefono: data.telefono,
          targa: data.targa,
        });

        const insertPerson = await client.query<Person>(queryText, queryValues);
        if (!insertPerson.rowCount) {
          throw new BaseError("Impossibile inserire persona", {
            status: 400,
            context: queryValues,
          });
        }
        personId = insertPerson.rows[0].id;
      } else {
        personId = existsPerson.rows[0].id;
      }

      const { queryText: insertArchRowText, queryValues: insertArchRowValues } =
        db.getInsertRowQuery(ArchTableName.PROVVISORI, {
          badge_cod: badgeCode,
          mark_type: MarkType.in,
          person_id: personId,
          post_id: data.post_id,
          username: data.username,
          ip: data.ip,
        });
      const insertArchRow = await client.query(
        insertArchRowText,
        insertArchRowValues
      );

      await client.query("COMMIT");

      return { insertArchRow, personId };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  public static async insertVeicoloProvvisorio(data: InsertArchVeicoloData) {
    const { rowCount: numFullInStruttRows } = await db.query<FullBadgeInStrutt>(
      `SELECT * FROM ${ArchTableName.VEICOLI_PROV} WHERE targa = $1 AND created_at IS NULL`,
      [data.targa]
    );
    if (numFullInStruttRows) {
      throw new BaseError("Badge Provvisorio già inserito", {
        status: 400,
        context: { targa: data.targa },
      });
    }

    return await db.insertRow<ArchivioVeicoloProv>(
      ArchTableName.VEICOLI_PROV,
      data
    );
  }

  public static async timbraUniversitario(data: TimbraBadgeData) {
    const badgeCode = data.badge_cod;
    const { rows: fullInStruttRows, rowCount: numFullInStruttRows } =
      await db.query<FullBadgeInStrutt>(
        `SELECT * FROM ${ArchTableName.FULL_BADGES_IN_STRUTT} WHERE codice = $1 AND ndoc = $1`,
        [badgeCode]
      );

    if (!numFullInStruttRows) {
      const { rows: insertedRows, rowCount: numInsertedRows } =
        await db.insertRow(ArchTableName.PROVVISORI, data);
      if (!numInsertedRows) {
        throw new BaseError("Impossibile timbrare badge", {
          status: 500,
          context: { badgeCode },
        });
      }

      const archId = insertedRows[0].id;
      const { rows: inStruttRows, rowCount: numInStruttRows } =
        await ArchivioDB.getBadgesInStrutt({ id: archId });
      if (!numInStruttRows) {
        throw new BaseError("Impossibile reperire badge in struttura", {
          status: 500,
          context: { archId, badgeCode },
        });
      }
      return { row: inStruttRows[0], isEntering: true };
    } else {
      const archId = fullInStruttRows[0].id;

      if (data.post_id != fullInStruttRows[0].post_id) {
        throw new BaseError("Impossibile timbrare badge da questa postazione", {
          status: 400,
          context: {
            archId,
            badgeCode,
            expectedPostazione: fullInStruttRows[0].post_id,
            actualPostazione: data.post_id,
          },
        });
      }

      const { rows: inStruttRows, rowCount: numInStruttRows } =
        await ArchivioDB.getBadgesInStrutt({ id: archId });
      if (!numInStruttRows) {
        throw new BaseError("Impossibile reperire badge in struttura", {
          status: 500,
          context: { archId, badgeCode },
        });
      }

      const { rowCount: numUpdatedRows } = await ArchivioDB.setArchRowDate(
        archId,
        ArchTableName.PROVVISORI,
        "out"
      );
      if (!numUpdatedRows) {
        throw new BaseError("Impossibile timbrare badge", {
          status: 500,
          context: { archId, badgeCode },
        });
      }

      // await db.query(
      //   `CALL mark_out(${archId}, \'\"${ArchTableName.PROVVISORI}\"\')`
      // );

      return { row: inStruttRows[0], isEntering: false };
    }
  }

  public static async timbraChiavi(data: TimbraChiaviData) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const badgeCode = data.badge_cod;

      const { rows: postazioniRows, rowCount: numPostazioniRows } =
        await client.query<Postazione>(
          PostazioniDB.getPostazioneByIdQueryText,
          [data.post_id]
        );
      if (!numPostazioniRows) {
        throw new BaseError("Postazione non valida", {
          status: 400,
          context: { badgeCode, postazioneId: data.post_id },
        });
      }

      const existsBadge = await client.query<Nominativo>(
        NominativiDB.getNominativoByCodiceQueryText,
        [badgeCode]
      );
      if (!existsBadge.rowCount) {
        throw new BaseError("Badge non valido", {
          status: 400,
          context: { badgeCode },
        });
      }

      const { cliente: actualCliente, stato, scadenza } = existsBadge.rows[0];
      const { cliente: expectedCliente } = postazioniRows[0];

      if (actualCliente !== expectedCliente) {
        throw new BaseError("Impossibile timbrare badge di un altro cliente", {
          status: 400,
          context: { badgeCode, actualCliente, expectedCliente },
        });
      } else if (stato !== BadgeState.VALIDO) {
        throw new BaseError("Badge non valido", {
          status: 400,
          context: { badgeCode, stato },
        });
      } else if (scadenza && new Date(scadenza) < new Date()) {
        throw new BaseError("Privacy scaduta", {
          status: 400,
          context: { badgeCode, scadenza },
        });
      }

      const findChiaviQueryText = [
        "SELECT * FROM chiavi WHERE cliente = $1",
        data.chiavi.map((_, i) => `codice=$${i + 2}`).join(" OR "),
      ].join(" AND ");
      const existingChiavi = await client.query<ArchivioChiave>(
        findChiaviQueryText,
        [actualCliente, ...data.chiavi]
      );
      if (existingChiavi.rowCount !== data.chiavi.length) {
        throw new BaseError(
          "Una o più chiavi non fanno parte del cliente attuale",
          {
            status: 400,
            context: {
              chiavi: data.chiavi,
              expectedLength: data.chiavi.length,
              actualLength: existingChiavi.rowCount,
            },
          }
        );
      }

      const { rows: chiaviInPrestito } = await client.query<{ chiave: string }>(
        `SELECT DISTINCT chiave FROM ${ArchTableName.IN_PRESTITO} WHERE badge = $1 AND cliente = $2`,
        [badgeCode, actualCliente]
      );

      const chiaviInPrestitoArr = chiaviInPrestito.map((row) => row.chiave);
      const chiaviInOut = data.chiavi.map((chiave) => [
        chiave,
        chiaviInPrestitoArr.includes(chiave) ? MarkType.keyOut : MarkType.keyIn,
      ]);

      const chiaviInOutValues = chiaviInOut.flatMap(
        ([chiaveCode, markType]) => [
          badgeCode,
          chiaveCode,
          markType,
          data.post_id,
          data.ip,
          data.username,
        ]
      );
      const chiaviInOutText =
        chiaviInOut.length > 0
          ? [
              "WITH inserted AS (INSERT INTO",
              ArchTableName.CHIAVI,
              "(badge_cod, chiave_cod, mark_type, post_id, ip, username) VALUES",
              chiaviInOutValues
                .map((_, i) => {
                  const queryArgTxt = `$${i + 1}`;
                  const numRowValues = 6;
                  switch (i % numRowValues) {
                    case 0:
                      return "(".concat(queryArgTxt);
                    case numRowValues - 1:
                      return queryArgTxt.concat(")");
                    default:
                      return queryArgTxt;
                  }
                })
                .join(","),
              `RETURNING *) SELECT * FROM ${ArchTableName.FULL_ARCHIVIO} WHERE id IN (SELECT id FROM inserted)`,
            ].join(" ")
          : "";

      await client.query("COMMIT");

      const dbRes = await client.query<ArchivioChiave>(
        chiaviInOutText,
        chiaviInOutValues
      );

      return {
        in: dbRes.rows.filter((row) => row.mark_type === MarkType.keyIn),
        out: dbRes.rows.filter((row) => row.mark_type === MarkType.keyOut),
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  public static async timbraChiaviProv(data: TimbraChiaviProvData) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const badgeCode = data.badge_cod;

      const { rows: postazioniRows, rowCount: numPostazioniRows } =
        await client.query<Postazione>(
          PostazioniDB.getPostazioneByIdQueryText,
          [data.post_id]
        );
      if (!numPostazioniRows) {
        throw new BaseError("Postazione non valida", {
          status: 400,
          context: { badgeCode, postazioneId: data.post_id },
        });
      }

      const existsBadge = await client.query<Provvisorio>(
        ProvvisoriDB.getProvvisorioByCodiceQueryText,
        [badgeCode]
      );
      if (!existsBadge.rowCount) {
        throw new BaseError("Badge non valido", {
          status: 400,
          context: { badgeCode },
        });
      }

      const { cliente: actualCliente, stato } = existsBadge.rows[0];
      const { cliente: expectedCliente } = postazioniRows[0];

      if (actualCliente !== expectedCliente) {
        throw new BaseError("Impossibile timbrare badge di un altro cliente", {
          status: 400,
          context: { badgeCode, actualCliente, expectedCliente },
        });
      } else if (stato !== BadgeState.VALIDO) {
        throw new BaseError("Badge non valido", {
          status: 400,
          context: { badgeCode, stato },
        });
      }

      const findChiaviQueryText = [
        "SELECT * FROM chiavi WHERE cliente = $1",
        data.chiavi.map((_, i) => `codice=$${i + 2}`).join(" OR "),
      ].join(" AND ");
      const existingChiavi = await client.query<ArchivioChiave>(
        findChiaviQueryText,
        [actualCliente, ...data.chiavi]
      );
      if (existingChiavi.rowCount !== data.chiavi.length) {
        throw new BaseError(
          "Una o più chiavi non fanno parte del cliente attuale",
          {
            status: 400,
            context: {
              chiavi: data.chiavi,
              expectedLength: data.chiavi.length,
              actualLength: existingChiavi.rowCount,
            },
          }
        );
      }

      const { rows: chiaviInPrestito } = await client.query<{
        id: number;
        chiave: string;
      }>(
        `SELECT DISTINCT id, chiave FROM ${ArchTableName.FULL_IN_PRESTITO} 
        WHERE substr(badge,1,1) = '2' AND badge = $1 AND cliente = $2`,
        [badgeCode, actualCliente]
      );

      const chiaviInPrestitoArr = chiaviInPrestito.map((row) => row.chiave);
      const chiaviInOut = data.chiavi.map((chiave) => [
        chiave,
        chiaviInPrestitoArr.includes(chiave) ? MarkType.keyOut : MarkType.keyIn,
      ]);

      let personId: number;
      const existsPerson = await client.query<Person>(
        "SELECT * FROM people WHERE cliente = $1 AND (cod_fisc = $2 OR (tdoc = $3 AND ndoc = $4) OR (nome = $5 AND cognome = $6)) LIMIT 1",
        [
          actualCliente,
          data.cod_fisc,
          data.tdoc,
          data.ndoc,
          data.nome,
          data.cognome,
        ]
      );

      if (!existsPerson.rowCount) {
        const { queryText, queryValues } = db.getInsertRowQuery("people", {
          cliente: actualCliente,
          cod_fisc: data.cod_fisc,
          tdoc: data.tdoc,
          ndoc: data.ndoc,
          nome: data.nome,
          cognome: data.cognome,
          assegnazione: data.assegnazione,
          ditta: data.ditta,
          telefono: data.telefono,
        });

        const insertPerson = await client.query<Person>(queryText, queryValues);
        if (!insertPerson.rowCount) {
          throw new BaseError("Impossibile inserire persona", {
            status: 400,
            context: queryValues,
          });
        }
        personId = insertPerson.rows[0].id;
      } else {
        personId = existsPerson.rows[0].id;
      }

      const chiaviInsertValues = chiaviInOut.flatMap(
        ([chiaveCode, markType]) => [
          badgeCode,
          chiaveCode,
          markType,
          data.post_id,
          data.ip,
          data.username,
          personId,
        ]
      );
      const chiaviInsertText =
        chiaviInOut.length > 0
          ? [
              "WITH inserted AS (INSERT INTO",
              ArchTableName.CHIAVI_PROV,
              "(badge_cod, chiave_cod, mark_type, post_id, ip, username, person_id) VALUES",
              chiaviInsertValues
                .map((_, i) => {
                  const queryArgTxt = `$${i + 1}`;
                  const numRowValues = 7;
                  switch (i % numRowValues) {
                    case 0:
                      return "(".concat(queryArgTxt);
                    case numRowValues - 1:
                      return queryArgTxt.concat(")");
                    default:
                      return queryArgTxt;
                  }
                })
                .join(","),
              `RETURNING *) SELECT * FROM ${ArchTableName.FULL_ARCHIVIO} WHERE id IN (SELECT id FROM inserted)`,
            ].join(" ")
          : "";

      await client.query("COMMIT");

      const dbRes = await client.query<ArchivioChiave>(
        chiaviInsertText,
        chiaviInsertValues
      );
      return {
        in: dbRes.rows.filter((row) => row.mark_type === MarkType.keyIn),
        out: dbRes.rows.filter((row) => row.mark_type === MarkType.keyOut),
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  public static async timbraChiaviNoBadge(data: TimbraChiaviNoBadgeData) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      const { rows: postazioniRows, rowCount: numPostazioniRows } =
        await client.query<Postazione>(
          PostazioniDB.getPostazioneByIdQueryText,
          [data.post_id]
        );
      if (!numPostazioniRows) {
        throw new BaseError("Postazione non valida", {
          status: 400,
          context: { postazioneId: data.post_id },
        });
      }

      const { cliente: expectedCliente } = postazioniRows[0];

      let personId: number;
      const existsPerson = await client.query<Person>(
        "SELECT * FROM people WHERE cliente = $1 AND (cod_fisc = $2 OR (tdoc = $3 AND ndoc = $4) OR (nome = $5 AND cognome = $6)) LIMIT 1",
        [
          expectedCliente,
          data.cod_fisc,
          data.tdoc,
          data.ndoc,
          data.nome,
          data.cognome,
        ]
      );

      if (!existsPerson.rowCount) {
        const { queryText, queryValues } = db.getInsertRowQuery("people", {
          cliente: expectedCliente,
          cod_fisc: data.cod_fisc,
          tdoc: data.tdoc,
          ndoc: data.ndoc,
          nome: data.nome,
          cognome: data.cognome,
          assegnazione: data.assegnazione,
          ditta: data.ditta,
          telefono: data.telefono,
        });

        const insertPerson = await client.query<Person>(queryText, queryValues);
        if (!insertPerson.rowCount) {
          throw new BaseError("Impossibile inserire persona", {
            status: 400,
            context: queryValues,
          });
        }
        personId = insertPerson.rows[0].id;
      } else {
        personId = existsPerson.rows[0].id;
      }

      const findChiaviQueryText = [
        "SELECT * FROM chiavi WHERE cliente = $1",
        data.chiavi.map((_, i) => `codice=$${i + 2}`).join(" OR "),
      ].join(" AND ");
      const existingChiavi = await client.query<ArchivioChiave>(
        findChiaviQueryText,
        [expectedCliente, ...data.chiavi]
      );
      if (existingChiavi.rowCount !== data.chiavi.length) {
        throw new BaseError(
          "Una o più chiavi non fanno parte del cliente attuale",
          {
            status: 400,
            context: {
              chiavi: data.chiavi,
              expectedLength: data.chiavi.length,
              actualLength: existingChiavi.rowCount,
            },
          }
        );
      }

      const { rows: chiaviInPrestito } = await client.query<{
        id: number;
        chiave: string;
      }>(
        `SELECT DISTINCT id, chiave FROM ${ArchTableName.FULL_IN_PRESTITO} 
        WHERE badge IS NULL AND cliente = $1 AND person_id = $2`,
        [expectedCliente, personId]
      );

      const chiaviInPrestitoArr = chiaviInPrestito.map((row) => row.chiave);
      const chiaviInOut = data.chiavi.map((chiave) => [
        chiave,
        chiaviInPrestitoArr.includes(chiave) ? MarkType.keyOut : MarkType.keyIn,
      ]);

      const chiaviInsertValues = chiaviInOut.flatMap(
        ([chiaveCode, markType]) => [
          chiaveCode,
          markType,
          data.post_id,
          data.ip,
          data.username,
          personId,
        ]
      );
      const chiaviInsertText =
        chiaviInOut.length > 0
          ? [
              "WITH inserted AS (INSERT INTO",
              ArchTableName.CHIAVI_PROV,
              "(chiave_cod, mark_type, post_id, ip, username, person_id) VALUES",
              chiaviInsertValues
                .map((_, i) => {
                  const queryArgTxt = `$${i + 1}`;
                  const numRowValues = 6;
                  switch (i % numRowValues) {
                    case 0:
                      return "(".concat(queryArgTxt);
                    case numRowValues - 1:
                      return queryArgTxt.concat(")");
                    default:
                      return queryArgTxt;
                  }
                })
                .join(","),
              `RETURNING *) SELECT * FROM ${ArchTableName.FULL_ARCHIVIO} WHERE id IN (SELECT id FROM inserted)`,
            ].join(" ")
          : "";

      await client.query("COMMIT");

      const dbRes = await client.query<ArchivioChiave>(
        chiaviInsertText,
        chiaviInsertValues
      );
      return {
        in: dbRes.rows.filter((row) => row.mark_type === MarkType.keyIn),
        out: dbRes.rows.filter((row) => row.mark_type === MarkType.keyOut),
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  public static async getTracciati(filter: GetResocontoFilter) {
    const prefixText = "SELECT * FROM tracciati";
    const filterText =
      filter &&
      Object.entries(filter)
        .filter(([, value]) => value)
        .map(([key], i) => {
          switch (key) {
            case "minDate":
              return `created_at >= $${i + 1}`;
            case "maxDate":
              return `created_at <= $${i + 1}`;
            default:
              return `${key}=$${i + 1}`;
          }
        })
        .join(" AND ");
    const queryText = filterText
      ? [prefixText, filterText].join(" WHERE ")
      : prefixText;
    const queryValues = Object.values(filter).filter((v) => v);
    return await db.query<Tracciato>(queryText, queryValues);
  }

  public static async pausa(data: TimbraBadgeData) {
      const badgeCode = data.badge_cod;
      const existsBadge = await db.query<Nominativo>(
        NominativiDB.getNominativoByCodiceQueryText,
        [badgeCode]
      );
      if (!existsBadge.rowCount) {
        throw new BaseError("Badge non esistente", {
          status: 400,
          context: { badgeCode },
        });
      }

      const { cliente: expectedCliente } = existsBadge.rows[0];

      const postazioneMark = await db.query<Postazione>(
        PostazioniDB.getPostazioneByIdQueryText,
        [data.post_id]
      );
      if (!postazioneMark.rowCount) {
        throw new BaseError("Postazione non esistente", {
          status: 400,
          context: { postId: data.post_id },
        });
      } else if (postazioneMark.rows[0].cliente !== expectedCliente) {
        throw new BaseError("Impossibile timbrare badge di un altro cliente", {
          status: 400,
          context: {
            badgeCode,
            expectedCliente,
            actualCliente: postazioneMark.rows[0].cliente,
          },
        });
      }

      const { rows: inStruttRows, rowCount: numInStruttRows } =
        await db.query<FullBadgeInStrutt>(
          `SELECT * FROM ${ArchTableName.FULL_BADGES_IN_STRUTT} WHERE codice = $1`,
          [badgeCode]
        );
      if (!numInStruttRows) {
        throw new BaseError("Badge non presente in struttura", {
          status: 400,
          context: { badgeCode },
        });
      }

      const { mark_type: markTypeIn } = inStruttRows[0];

      if (
        markTypeIn !== MarkType.pauseIn &&
        postazioneMark.rows[0].id != inStruttRows[0].post_id
      ) {
        throw new BaseError(
          "Impossibile timbrare badge da un'altra postazione",
          {
            status: 400,
            context: {
              expectedPostazione: inStruttRows[0].post_id,
              actualPostazione: postazioneMark.rows[0].id,
              markType: markTypeIn,
            },
          }
        );
      }

      let markTypeOut: MarkType;
      switch (markTypeIn) {
        case MarkType.in:
          markTypeOut = MarkType.pauseIn;
          break;
        case MarkType.pauseIn:
          markTypeOut = MarkType.pauseOut;
          break;
        default:
          throw new BaseError("Tipo marcatura non valida", {
            status: 500,
            context: { markType: markTypeIn },
          });
      }

      const { rows: insertedRows, rowCount: numInsertedRows } =
        await db.insertRow(ArchTableName.NOMINATIVI, {
          ...data,
          mark_type: markTypeOut,
        });
      if (!numInsertedRows) {
        throw new BaseError("Impossibile timbrare badge", {
          status: 500,
          context: { badgeCode },
        });
      }

      return {
        in: inStruttRows[0],
        out: insertedRows[0],
      };
  }

  public static async updateArchivio({ id, created_at }: UpdateArchivioData) {
    return await db.updateRows(
      ArchTableName.NOMINATIVI,
      { created_at },
      { id }
    );
  }
}

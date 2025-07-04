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
  TimbraNomInWithDateData,
  TimbraNomOutWithDateData,
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
import PeopleDB from "./people.js";

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
      ? [prefixText, "WHERE", filterText].join(" ")
      : prefixText;
    const queryValues =
      filter &&
      Object.values(filter)
        .filter((value) => value)
        .map((value) => (typeof value !== "string" ? value : `%${value}%`));

    return await db.query<Archivio>(queryText, queryValues);
  }

  public static async getBadgesInStrutt(filter?: FindInStruttBadgesFilter) {
    let i = 1;
    const prefixText = `SELECT id, codice, descrizione, assegnazione, cliente, postazione, nome, cognome, ditta, data_in FROM ${ArchTableName.FULL_BADGES_IN_STRUTT}`;
    let filterText = filter
      ? Object.entries(filter)
        .filter(([key, value]) => value && !["pausa"].includes(key))
        .map(([key, value]) => {
          switch (key) {
            case "postazioniIds":
              if (!Array.isArray(value)) return "";
              const postazioniFilters = value.map(() => `post_id=$${i++}`);
              if (filter?.pausa === true)
                postazioniFilters.push("postazione='PAUSA'");
              return ["(", postazioniFilters.join(" OR "), ")"].join("");
            case "data_in_min":
              return `data_in>=$${i++}`;
            case "data_in_max":
              return `data_in<=$${i++}`;
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
      const pauseFilter = "postazione!='PAUSA'";
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
    const prefixText = `SELECT id, targa, descrizione, tveicolo, assegnazione, cliente, postazione, nome, cognome, ditta, data_in FROM ${ArchTableName.FULL_VEICOLI_IN_STRUTT}`;
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
    const prefixText = `SELECT badge, chiave, cliente, postazione, assegnazione, nome, cognome, ditta, indirizzo, citta, edificio, piano, data_in FROM ${ArchTableName.FULL_IN_PRESTITO}`;
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
      ? [prefixText, "WHERE", filterText, "ORDER BY data_in DESC"].join(" ")
      : [prefixText, "ORDER BY data_in DESC"].join(" ");
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

  public static async timbraNominativoIn(
    data: TimbraBadgeData | TimbraNomInWithDateData
  ) {
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
      await db.insertRow<ArchivioNominativo>(ArchTableName.NOMINATIVI, data);
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

  public static async timbraNominativoOut(
    data: TimbraBadgeData | TimbraNomOutWithDateData
  ) {
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

    const archId = fullInStruttRows[0].id;

    const { rowCount: numInStruttRows, rows: inStruttRows } =
      await ArchivioDB.getBadgesInStrutt({ id: archId });
    if (!numInStruttRows) {
      throw new BaseError("Impossibile reperire badge in struttura", {
        status: 500,
        context: { archId, badgeCode },
      });
    }

    const { rowCount: updatedRowsNum } = await ArchivioDB.setArchRowDate(
      archId,
      ArchTableName.NOMINATIVI,
      "out"
    );
    if (!updatedRowsNum) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 400,
        context: { archId, badgeCode },
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
        `SELECT * FROM ${ArchTableName.PROVVISORI} WHERE badge_cod = $1 ORDER BY data_in DESC, data_out DESC`,
        [badgeCode]
      );
    const currDate = new Date();
    const dateIn = new Date(archRows[0].data_in);
    const dateOut = new Date(archRows[0].data_out);
    if (!numArchRows || dateOut < currDate) {
      throw new BaseError("Inserire il badge provvisorio prima di timbrare", {
        status: 400,
        context: { badgeCode, dateOut, currDate, pred: dateOut < currDate },
      });
    } else if (dateIn < currDate && dateOut > currDate) {
      throw new BaseError("Badge già presente in struttura", {
        status: 400,
        context: { badgeCode, dateIn: archRows[0].data_in },
      });
    }

    const archId = archRows[0].id;

    const { rowCount: numUpdatedRows } = await ArchivioDB.setArchRowDate(
      archId,
      ArchTableName.PROVVISORI,
      "in"
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

    const { rowCount: numUpdatedRows } = await ArchivioDB.setArchRowDate(
      archId,
      ArchTableName.PROVVISORI,
      "out"
    );
    if (!numUpdatedRows) {
      throw new BaseError("Impossibile timbrare badge", {
        status: 400,
        context: { archId, badgeCode },
      });
    }

    // await db.query(
    //   `CALL mark_out(${archId}, \'\"${ArchTableName.PROVVISORI}\"\')`
    // );

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
          `SELECT * FROM ${ArchTableName.PROVVISORI} WHERE badge_cod = $1 AND data_in > CURRENT_TIMESTAMP(0)`,
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
      `SELECT * FROM ${ArchTableName.VEICOLI_PROV} WHERE targa = $1 AND data_in > CURRENT_TIMESTAMP(0)`,
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

      const { rows: chiaviInPrestito } = await client.query<{
        id: number;
        chiave: string;
      }>(
        `SELECT DISTINCT id, chiave FROM ${ArchTableName.IN_PRESTITO} WHERE badge = $1 AND cliente = $2`,
        [badgeCode, actualCliente]
      );

      const chiaviIn: string[] = [];
      const chiaviOut: number[] = [];
      data.chiavi.forEach((chiave) => {
        const id = chiaviInPrestito.find((row) => row.chiave == chiave)?.id;
        if (id) chiaviOut.push(id);
        else chiaviIn.push(chiave);
      });

      const chiaviInValues = chiaviIn.flatMap((chiaveCode) => [
        badgeCode,
        chiaveCode,
        data.post_id,
        data.ip,
        data.username,
      ]);
      const chiaviInText =
        chiaviIn.length > 0
          ? [
            "WITH inserted AS (INSERT INTO",
            ArchTableName.CHIAVI,
            "(badge_cod, chiave_cod, post_id, ip, username) VALUES",
            chiaviInValues
              .map((_, i) => {
                const queryArgTxt = `$${i + 1}`;
                const numRowValues = 5;
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
            `RETURNING *) SELECT * FROM ${ArchTableName.FULL_IN_PRESTITO} WHERE id IN (SELECT id FROM inserted)`,
          ].join(" ")
          : "";
      const chiaviInRes = await client.query<ArchivioChiave>(
        chiaviInText,
        chiaviInValues
      );

      const chiaviOutText =
        chiaviOut.length > 0
          ? [
            "UPDATE",
            ArchTableName.CHIAVI,
            "SET data_out = CURRENT_TIMESTAMP(0) WHERE",
            chiaviOut.map((_, i) => `id = $${i + 1}`).join(" OR "),
            "RETURNING *",
          ].join(" ")
          : "";
      const chiaviOutRes = await client.query<ArchivioChiave>(
        chiaviOutText,
        chiaviOut
      );

      // await client.query(
      //   `CALL mark_out_many({${chiaviOut.join(",")}}, \'\"${
      //     ArchTableName.CHIAVI
      //   }\"\')`
      // );

      await client.query("COMMIT");

      return { in: chiaviInRes, out: chiaviOutRes };
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

      const chiaviIn: string[] = [];
      const chiaviOut: number[] = [];
      data.chiavi.forEach((chiave) => {
        const id = chiaviInPrestito.find((row) => row.chiave == chiave)?.id;
        if (id) chiaviOut.push(id);
        else chiaviIn.push(chiave);
      });

      let personId: number;
      if (chiaviIn.length > 0) {
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

          const insertPerson = await client.query<Person>(
            queryText,
            queryValues
          );
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
      }

      const chiaviInsertValues = chiaviIn.flatMap((chiaveCode) => [
        badgeCode,
        chiaveCode,
        data.post_id,
        data.ip,
        data.username,
        personId,
      ]);
      const chiaviInsertText =
        chiaviIn.length > 0
          ? [
            "INSERT INTO",
            ArchTableName.CHIAVI_PROV,
            "(badge_cod, chiave_cod, post_id, ip, username, person_id) VALUES",
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
              "RETURNING *"
          ].join(" ")
          : "";
      const chiaviInsertRes = await client.query<ArchivioChiave>(
        chiaviInsertText,
        chiaviInsertValues
      );

      const chiaviInValues = chiaviInsertRes.rows.map((row) => row.id);
      const chiaviInText = `SELECT * FROM ${ArchTableName.FULL_IN_PRESTITO} 
        WHERE id IN (${chiaviInValues.map((_, i) => `$${i + 1}`).join(",")})`;
      const chiaviInRes = await client.query<ArchivioChiave>(chiaviInText, chiaviInValues);

      const chiaviOutText =
        chiaviOut.length > 0
          ? [
            "UPDATE",
            ArchTableName.CHIAVI_PROV,
            "SET data_out = CURRENT_TIMESTAMP(0) WHERE",
            chiaviOut.map((_, i) => `id = $${i + 1}`).join(" OR "),
            "RETURNING *",
          ].join(" ")
          : "";
      const chiaviOutRes = await client.query<ArchivioChiave>(
        chiaviOutText,
        chiaviOut
      );

      await client.query("COMMIT");

      return { in: chiaviInRes, out: chiaviOutRes };
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

      const chiaviIn: string[] = [];
      const chiaviOut: number[] = [];
      data.chiavi.forEach((chiave) => {
        const id = chiaviInPrestito.find((row) => row.chiave == chiave)?.id;
        if (id) chiaviOut.push(id);
        else chiaviIn.push(chiave);
      });

      const chiaviInsertValues = chiaviIn.flatMap((chiaveCode) => [
        chiaveCode,
        data.post_id,
        data.ip,
        data.username,
        personId,
      ]);
      const chiaviInsertText =
        chiaviIn.length > 0
          ? [
            "INSERT INTO",
            ArchTableName.CHIAVI_PROV,
            "(chiave_cod, post_id, ip, username, person_id) VALUES",
            chiaviInsertValues
              .map((_, i) => {
                const queryArgTxt = `$${i + 1}`;
                const numRowValues = 5;
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
              "RETURNING *"
          ].join(" ")
          : "";
      const chiaviInsertRes = await client.query<ArchivioChiave>(
        chiaviInsertText,
        chiaviInsertValues
      );

      const chiaviInValues = chiaviInsertRes.rows.map((row) => row.id);
      const chiaviInText = chiaviInValues.length > 0 ? `SELECT * FROM ${ArchTableName.FULL_IN_PRESTITO} 
        WHERE id IN (${chiaviInValues.map((_, i) => `$${i + 1}`).join(",")})` : "";
      const chiaviInRes = await client.query<ArchivioChiave>(chiaviInText, chiaviInValues);

      const chiaviOutText =
        chiaviOut.length > 0
          ? [
            "UPDATE",
            ArchTableName.CHIAVI_PROV,
            "SET data_out = CURRENT_TIMESTAMP(0) WHERE",
            chiaviOut.map((_, i) => `id = $${i + 1}`).join(" OR "),
            "RETURNING *",
          ].join(" ")
          : "";
      const chiaviOutRes = await client.query<ArchivioChiave>(
        chiaviOutText,
        chiaviOut
      );

      await client.query("COMMIT");

      return { in: chiaviInRes, out: chiaviOutRes };
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
              return `data_in >= $${i + 1}`;
            case "maxDate":
              return `data_in <= $${i + 1}`;
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
    const client = await db.getClient();
    try {
      await client.query("BEGIN");

      const badgeCode = data.badge_cod;
      const existsBadge = await client.query<Nominativo>(
        NominativiDB.getNominativoByCodiceQueryText,
        [badgeCode]
      );
      if (!existsBadge.rowCount) {
        throw new BaseError("Badge non esistente", {
          status: 400,
          context: { badgeCode },
        });
      }

      const existsReqPost = await client.query<Postazione>(
        PostazioniDB.getPostazioneByIdQueryText,
        [data.post_id]
      );
      if (!existsReqPost.rowCount) {
        throw new BaseError("Postazione non esistente", {
          status: 400,
          context: { postId: data.post_id },
        });
      } else if (existsReqPost.rows[0].name === "PAUSA") {
        throw new BaseError("Postazione non valida", {
          status: 400,
          context: { postId: data.post_id },
        });
      }

      const reqPostazione = existsReqPost.rows[0];

      const existsPausaPostazione = await client.query<Postazione>(
        "SELECT * FROM postazioni WHERE name = 'PAUSA' AND cliente = $1",
        [reqPostazione.cliente]
      );
      if (!existsPausaPostazione.rowCount) {
        throw new BaseError(
          "Pausa non disponibile per il cliente selezionato",
          {
            status: 400,
            context: { cliente: reqPostazione.cliente },
          }
        );
      }

      const pausaPostId = existsPausaPostazione.rows[0].id;

      const { rows: inStruttRows, rowCount: numInStruttRows } =
        await client.query<FullBadgeInStrutt>(
          `SELECT * FROM ${ArchTableName.FULL_BADGES_IN_STRUTT} WHERE codice = $1`,
          [badgeCode]
        );
      if (!numInStruttRows) {
        throw new BaseError("Badge non presente in struttura", {
          status: 400,
          context: { badgeCode },
        });
      }

      const archId = inStruttRows[0].id;

      const isInPausa = inStruttRows[0].postazione === "PAUSA";
      if (!isInPausa && reqPostazione.id != inStruttRows[0].post_id) {
        throw new BaseError(
          "Impossibile timbrare badge da un'altra postazione",
          {
            status: 400,
            context: {
              archId,
              expectedPostazione: inStruttRows[0].post_id,
              actualPostazione: reqPostazione.id,
            },
          }
        );
      } else if (
        isInPausa &&
        reqPostazione.cliente !== inStruttRows[0].cliente
      ) {
        throw new BaseError("Impossibile timbrare badge da un altro cliente", {
          status: 400,
          context: {
            archId,
            expectedCliente: inStruttRows[0].cliente,
            actualCliente: reqPostazione.cliente,
          },
        });
      }

      const { rows: updatedRows, rowCount: numUpdatedRows } =
        await client.query(
          `UPDATE ${ArchTableName.NOMINATIVI} SET data_out = CURRENT_TIMESTAMP(0) WHERE id = $1`,
          [archId]
        );

      const insertQueryData = isInPausa
        ? data
        : { ...data, post_id: pausaPostId };
      const { queryText: insertQueryText, queryValues: insertQueryValues } =
        db.getInsertRowQuery(ArchTableName.NOMINATIVI, insertQueryData);
      const { rows: insertedRows, rowCount: numInsertedRows } =
        await client.query(insertQueryText, insertQueryValues);

      if (!numInsertedRows || !numUpdatedRows) {
        throw new BaseError("Impossibile completare operazione", {
          status: 500,
          context: { badgeCode },
        });
      }

      await client.query("COMMIT");

      return { in: insertedRows[0], out: updatedRows[0] };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  public static async updateArchivio({
    id,
    data_in,
    data_out,
  }: UpdateArchivioData) {
    return await db.updateRows(
      ArchTableName.NOMINATIVI,
      { data_in, data_out },
      { id }
    );
  }
}

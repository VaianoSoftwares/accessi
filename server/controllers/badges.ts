import { Request, Response } from "express";
import * as BadgesDB from "../db/badges.js";
import { Err, Ok } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";
import createBarcode from "../utils/barcodeGen.js";
import { Badge, BadgePrefix } from "../types/badges.js";
import { objToUpperCase } from "../utils/objToUpperCase.js";

function reqDataToUpperCase<T extends object>(data: T) {
  return objToUpperCase(data, ["cliente"] satisfies Array<keyof Badge>);
}

export async function apiGetBadges(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_BADGES_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await BadgesDB.getBadges(reqDataToUpperCase(parsed.data));
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertBadge(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_BADGE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    parsed.data.proprietario = parsed.data.provvisorio
      ? undefined
      : parsed.data.proprietario;

    const codice = createBarcode(
      parsed.data,
      parsed.data.provvisorio
        ? BadgePrefix.PROVVISORIO
        : BadgePrefix.NOMINATIVO,
      parsed.data.cliente
    );

    const dbRes = await BadgesDB.insertBadge(
      reqDataToUpperCase({
        codice,
        descrizione: parsed.data.descrizione,
        stato: parsed.data.stato,
        ubicazione: parsed.data.ubicazione,
        cliente: parsed.data.cliente,
        proprietario: parsed.data.proprietario,
      })
    );
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ insertedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdateBadge(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_BADGE_SCHEMA.safeParse({
      codice: req.params.codice,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { codice, updateData } = parsed.data;

    const dbRes = await BadgesDB.updateBadge({
      codice,
      updateData: reqDataToUpperCase(updateData),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ updatedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteBadge(req: Request, res: Response) {
  try {
    const parsed = Validator.DELETE_BADGE_SCHEMA.safeParse(req.params.codice);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice = parsed.data;

    const dbRes = await BadgesDB.deleteBadge(codice);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ deletedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

import { Request, Response } from "express";
import * as ChiaviDB from "../db/chiavi.js";
import { Err, Ok } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";
import createBarcode from "../utils/barcodeGen.js";
import { BadgePrefix } from "../types/badges.js";
import { objToUpperCase } from "../utils/objToUpperCase.js";
import { Chiave } from "../types/chiavi.js";

function reqDataToUpperCase<T extends object>(data: T) {
  return objToUpperCase(data, ["cliente"] satisfies Array<keyof Chiave>);
}

export async function apiGetChiavi(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_CHIAVI_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await ChiaviDB.getChiavi(reqDataToUpperCase(parsed.data));
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertChiavi(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_CHIAVE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice = createBarcode(
      parsed.data,
      BadgePrefix.CHIAVE,
      parsed.data.cliente
    );

    const dbRes = await ChiaviDB.insertChiave(
      reqDataToUpperCase({
        ...parsed.data,
        codice,
      })
    );
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire chiave", {
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

export async function apiUpdateChiave(req: Request, res: Response) {
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

    const dbRes = await ChiaviDB.updateChiave({
      codice,
      updateData: reqDataToUpperCase(updateData),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare chiave", {
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

export async function apiDeleteChiave(req: Request, res: Response) {
  try {
    const parsed = Validator.DELETE_BADGE_SCHEMA.safeParse(req.params.codice);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice = parsed.data;

    const dbRes = await ChiaviDB.deleteChiave(codice);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare chiave", {
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

import { Request, Response } from "express";
import { objToUpperCase } from "../utils/objToUpperCase.js";
import { BaseError } from "../types/errors.js";
import { Ok, Err } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as Validator from "../utils/validation.js";
import * as VeicoliDB from "../db/veicoli.js";
import { Veicolo } from "../types/veicoli.js";

function reqDataToUpperCase<T extends object>(data: T) {
  return objToUpperCase(data, ["cliente"] satisfies Array<keyof Veicolo>);
}

export async function apiGetVeicoli(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_VEICOLI_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await VeicoliDB.getVeicoli(reqDataToUpperCase(parsed.data));
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertVeicolo(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_VEICOLO_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await VeicoliDB.insertVeicolo(
      reqDataToUpperCase(parsed.data)
    );
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire badge", {
        status: 500,
        context: { targa: parsed.data.targa },
      });
    }
    res.json(Ok({ insertedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdateVeicolo(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_VEICOLO_SCHEMA.safeParse({
      codice: req.params.codice,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { id, updateData } = parsed.data;

    const dbRes = await VeicoliDB.updateVeicolo({
      id,
      updateData: reqDataToUpperCase(updateData),
    });

    res.json(Ok({ updatedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteVeicolo(req: Request, res: Response) {
  try {
    const parsed = Validator.ID_SCHEMA("Veicolo ID").safeParse(
      req.params.codice
    );
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const id = parsed.data;

    const dbRes = await VeicoliDB.deleteVeicolo(id);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { id },
      });
    }

    res.json(Ok({ deletedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetTVeicoli(req: Request, res: Response) {
  try {
    const dbRes = await VeicoliDB.getTVeicoli();
    res.json(Ok(dbRes.rows.map(({ value }) => value)));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

import { Request, Response } from "express";
import * as Validator from "../utils/validation.js";
import { Err, Ok } from "../_types/index.js";
import { BaseError } from "../_types/errors.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as PostazioniDB from "../db/postazioni.js";

export async function apiGetPostazioni(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_POSTAZIONI_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await PostazioniDB.getPostazioni(parsed.data);
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertPostazione(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_POSTAZIONE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { cliente, name } = parsed.data;

    const dbRes = await PostazioniDB.insertPostazione({ cliente, name });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire postazione", {
        status: 500,
        context: { postazione: { cliente, name } },
      });
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeletePostazione(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      throw new BaseError("Postazione ID non corretto", {
        status: 400,
        context: { id },
      });
    }

    const dbRes = await PostazioniDB.deletePostazione(id);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare postazione", {
        status: 500,
        context: { postazione: { id } },
      });
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

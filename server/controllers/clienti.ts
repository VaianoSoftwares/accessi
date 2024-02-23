import { Request, Response } from "express";
import * as Validator from "../utils/validation.js";
import { Err, Ok } from "../_types/index.js";
import { BaseError } from "../_types/errors.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as PostazioniDB from "../db/postazioni.js";

export async function apiGetClienti(req: Request, res: Response) {
  try {
    const dbRes = await PostazioniDB.getClienti();
    res.json(Ok(dbRes.rows.map(({ name }) => name)));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertCliente(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_CLIENTE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const cliente = parsed.data.name;

    const dbRes = await PostazioniDB.insertCliente(cliente);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire cliente", {
        status: 500,
        context: { cliente },
      });
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteCliente(req: Request, res: Response) {
  try {
    const { cliente } = req.params;

    const dbRes = await PostazioniDB.deleteCliente(cliente);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare cliente", {
        status: 500,
        context: { cliente },
      });
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

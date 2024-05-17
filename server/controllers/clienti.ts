import { NextFunction, Request, Response } from "express";
import * as Validator from "../utils/validation.js";
import { Ok } from "../types/index.js";
import { BaseError } from "../types/errors.js";
import PostazioniDB from "../db/postazioni.js";

export default class ClientiController {
  public static async apiGetClienti(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dbRes = await PostazioniDB.getClienti();
      res.json(Ok(dbRes.rows.map(({ name }) => name)));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertCliente(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
      next(e);
    }
  }

  public static async apiDeleteCliente(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
      next(e);
    }
  }
}

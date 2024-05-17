import { NextFunction, Request, Response } from "express";
import ChiaviDB from "../db/chiavi.js";
import { Ok } from "../types/index.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";

export default class ChiaviController {
  public static async apiGetChiavi(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_CHIAVI_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await ChiaviDB.getChiavi(parsed.data);
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertChiave(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_CHIAVE_SCHEMA.safeParse(req.body);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbRes = await ChiaviDB.insertChiave(parsed.data);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile inserire chiave", {
          status: 500,
        });
      }

      res.json(Ok({ insertedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiUpdateChiave(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.UPDATE_CHIAVE_SCHEMA.safeParse({
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
        updateData,
      });
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile modificare chiave", {
          status: 500,
          context: { codice },
        });
      }

      res.json(Ok({ updatedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiDeleteChiave(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.CODICE_CHIAVE_SCHEMA.safeParse(
        req.params.codice
      );
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const { data: codice } = parsed;

      const dbRes = await ChiaviDB.deleteChiave(codice);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile eliminare chiave", {
          status: 500,
          context: { codice },
        });
      }

      res.json(Ok({ deletedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetEdifici(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dbRes = await ChiaviDB.getEdifici();
      res.json(Ok(dbRes.rows.map(({ value }) => value)));
    } catch (e) {
      next(e);
    }
  }
}

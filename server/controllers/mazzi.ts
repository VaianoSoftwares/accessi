import { NextFunction, Request, Response } from "express";
import { Ok } from "../types/index.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";
import MazziChiaviDB from "../db/mazzi.js";

export default class MazziChiaviController {
  public static async apiGetMazzi(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_MAZZI_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await MazziChiaviDB.getMazzi(parsed.data);
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertMazzo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_MAZZO_SCHEMA.safeParse(req.body);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbRes = await MazziChiaviDB.insertMazzo(parsed.data);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile inserire mazzo", {
          status: 500,
        });
      }

      res.json(Ok({ insertedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiUpdateMazzo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.UPDATE_MAZZO_SCHEMA.safeParse({
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

      const dbRes = await MazziChiaviDB.updateMazzo({
        codice,
        updateData,
      });
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile modificare mazzo", {
          status: 500,
          context: { codice },
        });
      }

      res.json(Ok({ updatedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiDeleteMazzo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.CODICE_MAZZO_SCHEMA.safeParse(req.params.codice);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const { data: codice } = parsed;

      const dbRes = await MazziChiaviDB.deleteMazzo(codice);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile eliminare mazzo", {
          status: 500,
          context: { codice },
        });
      }

      res.json(Ok({ deletedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetChiaviNotInMazzo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_FREE_KEYS_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await MazziChiaviDB.getChiaviNotInMazzo(
        parsed.data?.cliente
      );
      res.json(Ok(dbRes));
    } catch (e) {
      next(e);
    }
  }
}

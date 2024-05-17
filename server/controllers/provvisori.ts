import { NextFunction, Request, Response } from "express";
import ProvvisoriDB from "../db/provvisori.js";
import { Ok } from "../types/index.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";

export default class ProvvisoriController {
  public static async apiGetProvvisori(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_PROVVISORI_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await ProvvisoriDB.getProvvisori(parsed.data);
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertProvvisorio(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_PROVVISORIO_SCHEMA.safeParse(req.body);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbRes = await ProvvisoriDB.insertProvvisorio(parsed.data);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile inserire badge", {
          status: 500,
        });
      }

      res.json(Ok({ insertedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiUpdateProvvisorio(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.UPDATE_PROVVISORIO_SCHEMA.safeParse({
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

      const dbRes = await ProvvisoriDB.updateProvvisorio({
        codice,
        updateData,
      });
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile modificare badge", {
          status: 500,
          context: { codice },
        });
      }

      res.json(Ok({ updatedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiDeleteProvvisorio(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.CODICE_PROV_OR_STUD_SCHEMA.safeParse(
        req.params.codice
      );
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const { data: codice } = parsed;

      const dbRes = await ProvvisoriDB.deleteProvvisorio(codice);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile eliminare badge", {
          status: 500,
          context: { codice },
        });
      }

      res.json(Ok({ deletedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }
}

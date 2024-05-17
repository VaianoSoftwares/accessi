import { NextFunction, Request, Response } from "express";
import { BaseError } from "../types/errors.js";
import { Ok } from "../types/index.js";
import * as Validator from "../utils/validation.js";
import VeicoliDB from "../db/veicoli.js";

export default class VeicoliController {
  public static async apiGetVeicoli(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_VEICOLI_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await VeicoliDB.getVeicoli(parsed.data);
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertVeicolo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_VEICOLO_SCHEMA.safeParse(req.body);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbRes = await VeicoliDB.insertVeicolo(parsed.data);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile inserire badge", {
          status: 500,
          context: { targa: parsed.data.targa },
        });
      }
      res.json(Ok({ insertedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiUpdateVeicolo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      const { codice, updateData } = parsed.data;

      const dbRes = await VeicoliDB.updateVeicolo({
        codice,
        updateData,
      });

      res.json(Ok({ updatedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiDeleteVeicolo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.CODICE_VEICOLO_SCHEMA.safeParse(
        req.params.codice
      );
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const { data: codice } = parsed;

      const dbRes = await VeicoliDB.deleteVeicolo(codice);
      if (dbRes.rowCount === 0) {
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

  public static async apiGetTVeicoli(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dbRes = await VeicoliDB.getTVeicoli();
      res.json(Ok(dbRes.rows.map(({ value }) => value)));
    } catch (e) {
      next(e);
    }
  }
}

import { NextFunction, Request, Response } from "express";
import ProtocolliDB from "../db/protocolli.js";
import { Ok } from "../types/index.js";
import { BaseError } from "../types/errors.js";
import * as Validator from "../utils/validation.js";
import ProtocolliFileManager from "../files/protocolli.js";

export default class ProtocolliController {
  public static async apiGetProtocolli(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_PROTOCOLLI_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await ProtocolliDB.getProtocolli(req.query);
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertProtocollo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_PROTOCOLLO_SCHEMA.safeParse(req.body);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      if (!req.files?.docs) {
        throw new BaseError("Nessun documento da inserire", { status: 400 });
      }
      const docsToUpl = Array.isArray(req.files.docs)
        ? req.files.docs
        : [req.files.docs];

      const dbRes = await ProtocolliDB.insertProtocollo(parsed.data, docsToUpl);
      res.json(Ok(dbRes));
    } catch (e) {
      next(e);
    }
  }

  public static async apiDeleteProtocollo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const protId = Number.parseInt(req.params.id);
      if (Number.isNaN(protId)) {
        throw new BaseError("ID Protocollo non valido o mancante", {
          status: 400,
          context: { protId },
        });
      }

      const dbRes = await ProtocolliDB.deleteProtocollo(protId);
      if (dbRes.rowCount === 0) {
        throw new BaseError("Impossibile eliminare protocollo", {
          status: 500,
          context: { protId },
        });
      }

      const deletedDocs = await ProtocolliFileManager.deleteDocs(protId);

      res.json(Ok({ ...dbRes, deletedDocs }));
    } catch (e) {
      next(e);
    }
  }
}

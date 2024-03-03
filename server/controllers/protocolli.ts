import { Request, Response } from "express";
import * as ProtDB from "../db/protocolli.js";
import { Err, Ok } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { BaseError } from "../types/errors.js";
import * as Validator from "../utils/validation.js";
import * as FileManager from "../files/protocolli.js";

export async function apiGetProtocolli(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_PROTOCOLLI_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await ProtDB.getProtocolli(req.query);
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertProtocollo(req: Request, res: Response) {
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

    const dbRes = await ProtDB.insertProtocollo(parsed.data, docsToUpl);
    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteProtocollo(req: Request, res: Response) {
  try {
    const protId = Number.parseInt(req.params.id);
    if (Number.isNaN(protId)) {
      throw new BaseError("ID Protocollo non valido o mancante", {
        status: 400,
        context: { protId },
      });
    }

    const dbRes = await ProtDB.deleteProtocollo(protId);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare protocollo", {
        status: 500,
        context: { protId },
      });
    }

    const deletedDocs = await FileManager.deleteDocs(protId);

    res.json(Ok({ ...dbRes, deletedDocs }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

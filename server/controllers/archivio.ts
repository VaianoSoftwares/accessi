import { Request, Response } from "express";
import * as ArchivioDB from "../db/archivio.js";
import { Err, Ok } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { BaseError } from "../types/errors.js";
import * as Validator from "../utils/validation.js";
import { Archivio, BarcodePrefix } from "../types/archivio.js";
import { objToUpperCase } from "../utils/objToUpperCase.js";
import { uploadDocumento } from "../files/badges.js";

function reqDataToUpperCase<T extends object>(data: T) {
  return objToUpperCase(data, [
    "cliente",
    "postazione",
    "username",
  ] satisfies Array<keyof Archivio>);
}

export async function apiGetArchivio(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_ARCHIVIO_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbResult = await ArchivioDB.getArchivio(
      reqDataToUpperCase(parsed.data)
    );
    res.json(Ok(dbResult.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetBadgesInStrutt(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_IN_STRUTT_BADGES_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbResult = await ArchivioDB.getBadgesInStrutt(
      reqDataToUpperCase(parsed.data)
    );
    res.json(Ok(dbResult.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetVeicoliInStrutt(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_IN_STRUTT_VEICOLI_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbResult = await ArchivioDB.getVeicoliInStrutt(
      reqDataToUpperCase(parsed.data)
    );
    res.json(Ok(dbResult.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetInPrestito(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_IN_PRESTITO_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbResult = await ArchivioDB.getInPrestito(
      reqDataToUpperCase(parsed.data)
    );
    res.json(Ok(dbResult.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraBadge(req: Request, res: Response) {
  try {
    const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse({
      ...req.body,
      ip: req.ip,
      username: req.user?.name,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { badge } = parsed.data;

    const barcodeType = badge.length === 10 ? badge.substring(0, 2) : "UNI";

    const timbraData = {
      ...parsed.data,
      badge: badge.length === 10 ? badge.substring(1) : badge,
    };

    let dbRes;
    switch (barcodeType) {
      case BarcodePrefix.nominativoIn:
        dbRes = await ArchivioDB.timbraBadgeIn(timbraData);
        break;

      case BarcodePrefix.nominativoOut:
        dbRes = await ArchivioDB.timbraBadgeOut(timbraData);
        break;

      case BarcodePrefix.provvisorioIn:
        dbRes = await ArchivioDB.timbraBadgeProvIn(timbraData);
        break;

      case BarcodePrefix.provvisorioOut:
        dbRes = await ArchivioDB.timbraBadgeProvOut(timbraData);
        break;

      default:
        dbRes = await ArchivioDB.timbraUniversitario(timbraData);
        break;
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraVeicolo(req: Request, res: Response) {
  try {
    const parsed = Validator.TIMBRA_VEICOLO_SCHEMA.safeParse({
      ...req.body,
      ip: req.ip,
      username: req.user?.name,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await ArchivioDB.timbraVeicolo(parsed.data);
    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraChiavi(req: Request, res: Response) {
  try {
    const parsed = Validator.TIMBRA_CHIAVI_SCHEMA.safeParse({
      ...req.body,
      ip: req.ip,
      username: req.user?.name,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
        context: req.body,
      });
    }

    let badge: string | null = null;
    let chiavi: string[] = [];
    Array.from(new Set(parsed.data.barcodes))
      .map((barcode) =>
        barcode.length === 10 ? barcode.substring(1) : barcode
      )
      .forEach((barcode) => {
        const prefix = barcode.substring(0, 1);

        switch (prefix) {
          case "0":
            badge = barcode;
            break;
          case "2":
            chiavi.push(barcode);
            break;
        }
      });

    if (!badge) {
      throw new BaseError("Nessun badge selezionato", {
        status: 400,
        context: { barcodes: parsed.data.barcodes },
      });
    } else if (chiavi.length === 0) {
      throw new BaseError("Nessuna chiave selezionata", {
        status: 400,
        context: { barcodes: parsed.data.barcodes },
      });
    }

    const dbRes = await ArchivioDB.timbraChiavi({
      ...parsed.data,
      badge,
      chiavi,
    });

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertBadgeProvvisorio(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_ARCH_BADGE_SCHEMA.safeParse({
      ...req.body,
      ip: req.ip,
      username: req.user?.name,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbResult = await ArchivioDB.insertBadgeProvvisorio(
      reqDataToUpperCase({
        ...parsed.data,
        badge:
          parsed.data.badge.length === 10
            ? parsed.data.badge.substring(1)
            : parsed.data.badge,
      })
    );
    if (!dbResult.rowCount) {
      throw new BaseError("Impossibile inserire provvisorio", { status: 400 });
    }

    const archId = dbResult.rows[0].id;

    let uploadedFile;
    const documento = Array.isArray(req.files?.documento)
      ? req.files?.documento[0]
      : req.files?.documento;
    if (documento) {
      uploadedFile = await uploadDocumento(archId, documento);
    }

    res.json(Ok({ ...dbResult, uploadedFile }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertVeicoloProvvisorio(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_ARCH_VEICOLO_SCHEMA.safeParse({
      ...req.body,
      ip: req.ip,
      username: req.user?.name,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbResult = await ArchivioDB.insertBadgeProvvisorio(
      reqDataToUpperCase(parsed.data as any)
    );
    if (!dbResult.rowCount) {
      throw new BaseError("Impossibile inserire provvisorio", { status: 400 });
    }

    const archId = dbResult.rows[0].id;

    let uploadedFile;
    const documento = Array.isArray(req.files?.documento)
      ? req.files?.documento[0]
      : req.files?.documento;
    if (documento) {
      uploadedFile = await uploadDocumento(archId, documento);
    }

    res.json(Ok({ ...dbResult, uploadedFile }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

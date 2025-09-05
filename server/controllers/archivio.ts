import { NextFunction, Request, Response } from "express";
import ArchivioDB from "../db/archivio.js";
import { Err, Ok } from "../types/index.js";
import { BaseError } from "../types/errors.js";
import * as Validator from "../utils/validation.js";
import { BarcodePrefix, MarkType } from "../types/archivio.js";
import BadgesFileManager from "../files/badges.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import MazziChiaviDB from "../db/mazzi.js";

export default class ArchivioController {
  public static async apiGetArchivio(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_ARCHIVIO_SCHEMA.safeParse(req.query);
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbResult = await ArchivioDB.getArchivio(parsed.data);
      res.json(Ok(dbResult.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetBadgesInStrutt(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_IN_STRUTT_BADGES_SCHEMA.safeParse(req.query);
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbResult = await ArchivioDB.getBadgesInStrutt(parsed.data);
      res.json(Ok(dbResult.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetVeicoliInStrutt(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_IN_STRUTT_VEICOLI_SCHEMA.safeParse(
        req.query
      );
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbResult = await ArchivioDB.getVeicoliInStrutt(parsed.data);
      res.json(Ok(dbResult.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetInPrestito(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.FIND_IN_PRESTITO_SCHEMA.safeParse(req.query);
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbResult = await ArchivioDB.getInPrestito(parsed.data);
      res.json(Ok(dbResult.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiTimbraBadge(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse({
        ...req.body,
        ip: req.ip,
        username: req.user?.name,
      });
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const { badge_cod: badgeCode } = parsed.data;

      const barcodeType =
        badgeCode.length === 10 ? badgeCode.substring(0, 2) : "UNI";

      const timbraData = {
        ...parsed.data,
        badge_cod: badgeCode.length === 10 ? badgeCode.substring(1) : badgeCode,
      };

      let dbRes;
      switch (barcodeType) {
        case BarcodePrefix.nominativoIn:
          dbRes = await ArchivioDB.timbraNominativoIn(timbraData);
          break;

        case BarcodePrefix.nominativoOut:
          dbRes = await ArchivioDB.timbraNominativoOut(timbraData);
          break;

        case BarcodePrefix.provvisorioIn:
          dbRes = await ArchivioDB.timbraProvvisorioIn(timbraData);
          break;

        case BarcodePrefix.provvisorioOut:
          dbRes = await ArchivioDB.timbraProvvisorioOut(timbraData);
          break;

        default:
          dbRes = await ArchivioDB.timbraUniversitario(timbraData);
          break;
      }

      res.json(Ok(dbRes));
    } catch (e) {
      next(e);
    }
  }

  public static async apiTimbraVeicolo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.TIMBRA_VEICOLO_SCHEMA.safeParse({
        ...req.body,
        ip: req.ip,
        username: req.user?.name,
      });
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await ArchivioDB.timbraVeicolo(parsed.data);
      res.json(Ok(dbRes));
    } catch (e) {
      next(e);
    }
  }

  public static async apiTimbraChiavi(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.TIMBRA_CHIAVI_SCHEMA.safeParse({
        ...req.body,
        ip: req.ip,
        username: req.user?.name,
      });
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
          context: req.body,
        });
      }

      let badgeCode: string | null = null;
      let provvisorio = true;
      let chiavi: string[] = [];
      let mazzi: string[] = [];
      Array.from(new Set(parsed.data.barcodes)).forEach((barcode) => {
        const prefix = barcode.substring(0, 1);

        switch (prefix) {
          case BarcodePrefix.nominativoGenerico:
            badgeCode = barcode;
            provvisorio = false;
            break;
          case BarcodePrefix.provvisorioGenerico:
            badgeCode = barcode;
            provvisorio = true;
            break;
          case BarcodePrefix.chiaveGenerico:
            chiavi.push(barcode);
            break;
          case BarcodePrefix.mazzoChiavi:
            mazzi.push(barcode);
            break;
        }
      });

      if (mazzi.length > 0) {
        const chiaviInMazzi = await MazziChiaviDB.getChiaviFromMazziCodes(
          mazzi
        );
        chiavi.push(...chiaviInMazzi);
      }

      if (chiavi.length <= 0) {
        throw new BaseError("Nessuna chiave selezionata", {
          status: 400,
          context: { barcodes: parsed.data.barcodes },
        });
      }

      let dbResult;
      let uploadedFile;
      if (provvisorio) {
        if (badgeCode) {
          const dbData = {
            ...parsed.data,
            chiavi,
            badge_cod: badgeCode as string,
          };
          dbResult = await ArchivioDB.timbraChiaviProv(dbData);
        } else {
          const dbData = { ...parsed.data, chiavi, badge_cod: null };
          dbResult = await ArchivioDB.timbraChiaviNoBadge(dbData);
        }
        if (dbResult.in.length > 0) {
          const archId = dbResult.in[0].id;
          const personId = dbResult.in[0].person_id;

          const docs = Array.isArray(req.files?.docs)
            ? req.files?.docs[0]
            : req.files?.docs;
          if (docs) {
            uploadedFile = await BadgesFileManager.uploadDocArchChiavi(
              [archId, personId],
              docs
            );
          }
        }
      } else {
        const dbData = {
          ...parsed.data,
          badge_cod: badgeCode!,
          chiavi,
        };
        dbResult = await ArchivioDB.timbraChiavi(dbData);
      }

      res.json(Ok({ ...dbResult, uploadedFile }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertBadgeProvvisorio(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_ARCH_BADGE_SCHEMA.safeParse({
        ...req.body,
        ip: req.ip,
        username: req.user?.name,
      });
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbResult = await ArchivioDB.insertBadgeProvvisorio(parsed.data);
      if (!dbResult.insertArchRow.rowCount) {
        throw new BaseError("Impossibile inserire provvisorio", {
          status: 400,
        });
      }

      const { personId } = dbResult;

      let uploadedFile;
      const docs = Array.isArray(req.files?.docs)
        ? req.files?.docs[0]
        : req.files?.docs;
      if (docs) {
        uploadedFile = await BadgesFileManager.uploadDocumentoProv(
          personId,
          docs
        );
      }

      res.json(Ok({ ...dbResult, uploadedFile }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiInsertVeicoloProvvisorio(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_ARCH_VEICOLO_SCHEMA.safeParse({
        ...req.body,
        ip: req.ip,
        username: req.user?.name,
      });
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbResult = await ArchivioDB.insertVeicoloProvvisorio(parsed.data);
      if (!dbResult.rowCount) {
        throw new BaseError("Impossibile inserire provvisorio", {
          status: 400,
        });
      }

      const archId = dbResult.rows[0].id;

      let uploadedFile;
      const documento = Array.isArray(req.files?.documento)
        ? req.files?.documento[0]
        : req.files?.documento;
      if (documento) {
        uploadedFile = await BadgesFileManager.uploadDocumentoProv(
          archId,
          documento
        );
      }

      res.json(Ok({ ...dbResult, uploadedFile }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetTracciati(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_RESOCONTO_SCHEMA.safeParse(req.query);
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbResult = await ArchivioDB.getTracciati(parsed.data);
      const result = dbResult.rows
        .map(
          (row) =>
            `43 ${row.zuc_cod} ${row.formatted_date} ${row.markType} 0950 00 P`
        )
        .join("\n");

      res.json(Ok(result));
    } catch (e) {
      next(e);
    }
  }

  public static async apiPausa(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.PAUSA_SCHEMA.safeParse({
        ...req.body,
        ip: req.ip,
        username: req.user?.name,
      });
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const result = await ArchivioDB.pausa(parsed.data);
      res.json(Ok(result));
    } catch (e) {
      next(e);
    }
  }

  public static async apiUpdateArchivio(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.UPDATE_ARCHIVIO_SCHEMA.safeParse(req.body);
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const result = await ArchivioDB.updateArchivio(parsed.data);
      res.json(Ok(result));
    } catch (e) {
      next(e);
    }
  }

  public static async apiTimbraBadgesFromUtility(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.TIMBRA_NOM_BODY_SCHEMA.safeParse({
        items: req.body,
        username: req.user?.name,
        ip: req.ip,
      });
      if (!parsed.success) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      let response = [];
      for (const item of parsed.data) {
        try {
          const result = await ((item.mark_type & MarkType.inOut) === 0
            ? ArchivioDB.timbraNominativoIn(item)
            : ArchivioDB.timbraNominativoOut(item));
          response.push(Ok(result));
        } catch (e) {
          response.push(Err(enforceBaseErr(e)));
        }
      }

      // const response = await Promise.all(
      //   parsed.data.map(async (o) => {
      //     try {
      //       const result = await ((o.mark_type & MarkType.inOut) === 0
      //         ? ArchivioDB.timbraNominativoIn(o)
      //         : ArchivioDB.timbraNominativoOut(o));
      //       return Ok(result);
      //     } catch (e) {
      //       return Err(enforceBaseErr(e));
      //     }
      //   })
      // );

      res.json(Ok(response));
    } catch (e) {
      next(e);
    }
  }
}

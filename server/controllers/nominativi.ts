import { NextFunction, Request, Response } from "express";
import NominativiDB from "../db/nominativi.js";
import { Ok } from "../types/index.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";
import { FileArray } from "express-fileupload";
import BadgesFileManager from "../files/badges.js";

export default class NominativiController {
  public static async apiGetNominativi(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_NOMINATIVI_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await NominativiDB.getNominativi(parsed.data);
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  private static async uploadFiles(
    codice: string,
    files: FileArray | null | undefined
  ) {
    let uploadedFiles = [];

    const pfp =
      files?.pfp && (Array.isArray(files.pfp) ? files.pfp[0] : files.pfp);
    if (pfp) {
      const uploadedFile = await BadgesFileManager.uploadPfp(codice, pfp);
      uploadedFiles.push(uploadedFile);
    }

    const privacy =
      files?.privacy &&
      (Array.isArray(files.privacy) ? files.privacy[0] : files.privacy);
    if (privacy) {
      const uploadedFile = await BadgesFileManager.uploadPrivacy(
        codice,
        privacy
      );
      uploadedFiles.push(uploadedFile);
    }

    const documento =
      files?.documento &&
      (Array.isArray(files.documento) ? files.documento[0] : files.documento);
    if (documento) {
      const uploadedFile = await BadgesFileManager.uploadDocumento(
        codice,
        documento
      );
      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  }

  public static async apiInsertNominativo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_NOMINATIVO_SCHEMA.safeParse(req.body);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbRes = await NominativiDB.insertNominativo(parsed.data);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile inserire badge", {
          status: 500,
        });
      }

      const { codice } = dbRes.rows[0];
      const uploadedFiles = await NominativiController.uploadFiles(
        codice,
        req.files
      );

      res.json(Ok({ insertedRow: dbRes.rows[0], uploadedFiles }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiUpdateNominativo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.UPDATE_NOMINATIVO_SCHEMA.safeParse({
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

      const dbRes = await NominativiDB.updateNominativo({
        codice,
        updateData,
      });

      const uploadedFiles = await this.uploadFiles(codice, req.files);

      if (!dbRes.rowCount && uploadedFiles.length === 0) {
        throw new BaseError("Impossibile modificare badge", {
          status: 500,
          context: { codice },
        });
      }

      res.json(Ok({ updatedRow: dbRes.rows[0], uploadedFiles }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiDeleteNominativo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.CODICE_NOM_SCHEMA.safeParse(req.params.codice);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const codice = parsed.data;

      const dbRes = await NominativiDB.deleteNominativo(codice);
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

  public static async apiGetAssegnazioni(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dbRes = await NominativiDB.getAssegnazioni();
      res.json(Ok(dbRes.rows.map(({ value }) => value)));
    } catch (e) {
      next(e);
    }
  }
}

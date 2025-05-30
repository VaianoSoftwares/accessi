import { NextFunction, Request, Response } from "express";
import PeopleDB from "../db/people.js";
import { Ok } from "../types/index.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";
import { FileArray } from "express-fileupload";
import BadgesFileManager from "../files/badges.js";

export default class PeopleController {
  public static async apiGetPeople(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.GET_PEOPLE_SCHEMA.safeParse(req.query);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }
      const dbRes = await PeopleDB.getPeople(parsed.data);
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  private static async uploadFiles(
    id: number,
    files: FileArray | null | undefined
  ) {
    let uploadedFiles = [];

    const pfp =
      files?.pfp && (Array.isArray(files.pfp) ? files.pfp[0] : files.pfp);
    if (pfp) {
      const uploadedFile = await BadgesFileManager.uploadPfp(id, pfp);
      uploadedFiles.push(uploadedFile);
    }

    const privacy =
      files?.privacy &&
      (Array.isArray(files.privacy) ? files.privacy[0] : files.privacy);
    if (privacy) {
      const uploadedFile = await BadgesFileManager.uploadPrivacy(id, privacy);
      uploadedFiles.push(uploadedFile);
    }

    const documento =
      files?.documento &&
      (Array.isArray(files.documento) ? files.documento[0] : files.documento);
    if (documento) {
      const uploadedFile = await BadgesFileManager.uploadDocumento(
        id,
        documento
      );
      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  }

  public static async apiInsertPerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.INSERT_PERSON_SCHEMA.safeParse(req.body);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const dbRes = await PeopleDB.insertPerson(parsed.data);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile inserire badge", {
          status: 500,
        });
      }

      const { id } = dbRes.rows[0];
      const uploadedFiles = await PeopleController.uploadFiles(id, req.files);

      res.json(Ok({ insertedRow: dbRes.rows[0], uploadedFiles }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiUpdatePerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.UPDATE_PERSON_SCHEMA.safeParse({
        id: req.params.id,
        updateData: req.body,
      });
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const { id, updateData } = parsed.data;

      const dbRes = await PeopleDB.updatePerson({
        id,
        updateData,
      });

      const uploadedFiles = await PeopleController.uploadFiles(id, req.files);

      if (!dbRes.rowCount && uploadedFiles.length === 0) {
        throw new BaseError("Impossibile modificare badge", {
          status: 500,
          context: { id },
        });
      }

      res.json(Ok({ updatedRow: dbRes.rows[0], uploadedFiles }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiDeletePerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = Validator.CODICE_NOM_SCHEMA.safeParse(req.params.id);
      if (parsed.success === false) {
        throw new BaseError(parsed.error.errors[0].message, {
          status: 400,
          cause: parsed.error,
        });
      }

      const id = Number(parsed.data);

      const dbRes = await PeopleDB.deletePerson(id);
      if (!dbRes.rowCount) {
        throw new BaseError("Impossibile eliminare badge", {
          status: 500,
          context: { id },
        });
      }

      res.json(Ok({ deletedRow: dbRes.rows[0] }));
    } catch (e) {
      next(e);
    }
  }
}

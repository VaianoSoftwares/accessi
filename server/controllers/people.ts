import { Request, Response } from "express";
import { Person } from "../types/people.js";
import { objToUpperCase } from "../utils/objToUpperCase.js";
import { BaseError } from "../types/errors.js";
import { Ok, Err } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as Validator from "../utils/validation.js";
import * as PeoplesDB from "../db/people.js";
import * as Filemanager from "../files/badges.js";

function reqDataToUpperCase<T extends object>(data: T) {
  return objToUpperCase(data, ["cliente"] satisfies Array<keyof Person>);
}

export async function apiGetPeoples(req: Request, res: Response) {
  try {
    const parsed = Validator.GET_BADGES_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await PeoplesDB.getPeoples(reqDataToUpperCase(parsed.data));
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertPerson(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_PERSON_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await PeoplesDB.insertPerson(reqDataToUpperCase(parsed.data));
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire badge", {
        status: 500,
        context: { nome: parsed.data.nome, cognome: parsed.data.cognome },
      });
    }

    const personId = dbRes.rows[0].id;

    let uploadedFiles = [];

    const pfp =
      req.files?.pfp &&
      (Array.isArray(req.files.pfp) ? req.files.pfp[0] : req.files.pfp);
    if (pfp) {
      const uploadedFile = await Filemanager.uploadPfp(personId, pfp);
      uploadedFiles.push(uploadedFile);
    }

    const privacy =
      req.files?.privacy &&
      (Array.isArray(req.files.privacy)
        ? req.files.privacy[0]
        : req.files.privacy);
    if (privacy) {
      const uploadedFile = await Filemanager.uploadPrivacy(personId, privacy);
      uploadedFiles.push(uploadedFile);
    }

    const documento =
      req.files?.documento &&
      (Array.isArray(req.files.documento)
        ? req.files.documento[0]
        : req.files.documento);
    if (documento) {
      const uploadedFile = await Filemanager.uploadDocumento(
        personId,
        documento
      );
      uploadedFiles.push(uploadedFile);
    }

    res.json(Ok({ insertedRow: dbRes.rows[0], uploadedFiles }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdatePerson(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_PERSON_SCHEMA.safeParse({
      codice: req.params.codice,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { id, updateData } = parsed.data;

    const dbRes = await PeoplesDB.updatePerson({
      id,
      updateData: reqDataToUpperCase(updateData),
    });

    let uploadedFiles = [];

    const pfp =
      req.files?.pfp &&
      (Array.isArray(req.files.pfp) ? req.files.pfp[0] : req.files.pfp);
    if (pfp) {
      const uploadedFile = await Filemanager.uploadPfp(id, pfp);
      uploadedFiles.push(uploadedFile);
    }

    const privacy =
      req.files?.privacy &&
      (Array.isArray(req.files.privacy)
        ? req.files.privacy[0]
        : req.files.privacy);
    if (privacy) {
      const uploadedFile = await Filemanager.uploadPrivacy(id, privacy);
      uploadedFiles.push(uploadedFile);
    }

    const documento =
      req.files?.documento &&
      (Array.isArray(req.files.documento)
        ? req.files.documento[0]
        : req.files.documento);
    if (documento) {
      const uploadedFile = await Filemanager.uploadDocumento(id, documento);
      uploadedFiles.push(uploadedFile);
    }

    if (dbRes.rowCount === 0 && uploadedFiles.length === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { id },
      });
    }

    res.json(Ok({ updatedRow: dbRes.rows[0], uploadedFiles }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeletePerson(req: Request, res: Response) {
  try {
    const parsed = Validator.ID_SCHEMA("Person ID").safeParse(
      req.params.codice
    );
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const id = parsed.data;

    const dbRes = await PeoplesDB.deletePerson(id);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { id },
      });
    }

    const deletedPfp = await Filemanager.deletePfp(id);
    const deletedPrivacy = await Filemanager.deletePrivacy(id);
    const deleteDocumento = await Filemanager.deletePrivacy(id);

    res.json(
      Ok({
        deletedRow: dbRes.rows[0],
        deletedFiles: [deletedPfp, deletedPrivacy, deleteDocumento].filter(
          (v) => v
        ),
      })
    );
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetAssegnazioni(req: Request, res: Response) {
  try {
    const dbRes = await PeoplesDB.getAssegnazioni();
    res.json(Ok(dbRes.rows.map(({ value }) => value)));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

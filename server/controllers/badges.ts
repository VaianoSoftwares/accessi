import { Request, Response } from "express";
import * as BadgesDB from "../db/badges.js";
import { Err, Ok } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";
import createBarcode from "../utils/barcodeGen.js";
import { Badge, BadgePrefix } from "../types/badges.js";
import * as Filemanager from "../files/badges.js";

function reqDataToUpperCase<T extends object>(data: T) {
  const caseSensitiveAttributes: Array<keyof Badge> = ["cliente"];

  return Object.entries(data).map(([key, value]) =>
    typeof value !== "string" ||
    caseSensitiveAttributes.includes(key as keyof Badge)
      ? value
      : value.toUpperCase()
  ) as T;
}

export async function apiGetBadges(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_BADGES_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await BadgesDB.getBadges(reqDataToUpperCase(parsed.data));
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertNominativo(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_NOM_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice =
      parsed.data.codice ||
      createBarcode(parsed.data, BadgePrefix.NOMINATIVO, parsed.data.cliente);

    const dbRes = await BadgesDB.insertNominativo(
      reqDataToUpperCase({
        ...parsed.data,
        codice,
      })
    );
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire badge", {
        status: 500,
        context: { codice },
      });
    }

    let uploadedFiles = [];

    const pfp =
      req.files?.pfp &&
      (Array.isArray(req.files.pfp) ? req.files.pfp[0] : req.files.pfp);
    if (pfp) {
      const uploadedFile = await Filemanager.uploadPfp(codice, pfp);
      uploadedFiles.push(uploadedFile);
    }

    const privacy =
      req.files?.privacy &&
      (Array.isArray(req.files.privacy)
        ? req.files.privacy[0]
        : req.files.privacy);
    if (privacy) {
      const uploadedFile = await Filemanager.uploadPrivacy(codice, privacy);
      uploadedFiles.push(uploadedFile);
    }

    res.json(Ok({ insertedRow: dbRes.rows[0], uploadedFiles }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdateNominativo(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_NOM_SCHEMA.safeParse({
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

    const dbRes = await BadgesDB.updateNominativo({
      codice,
      updateData: reqDataToUpperCase(updateData),
    });

    let uploadedFiles = [];

    const pfp =
      req.files?.pfp &&
      (Array.isArray(req.files.pfp) ? req.files.pfp[0] : req.files.pfp);
    if (pfp) {
      const uploadedFile = await Filemanager.uploadPfp(codice, pfp);
      uploadedFiles.push(uploadedFile);
    }

    const privacy =
      req.files?.privacy &&
      (Array.isArray(req.files.privacy)
        ? req.files.privacy[0]
        : req.files.privacy);
    if (privacy) {
      const uploadedFile = await Filemanager.uploadPrivacy(codice, privacy);
      uploadedFiles.push(uploadedFile);
    }

    if (dbRes.rowCount === 0 && uploadedFiles.length === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ updatedRow: dbRes.rows[0], uploadedFiles }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteNominativo(req: Request, res: Response) {
  try {
    const parsed = Validator.CODICE_NOM_SCHEMA.safeParse(req.params.codice);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice = parsed.data;

    const dbRes = await BadgesDB.deleteNominativo(codice);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice },
      });
    }

    const deletedPfp = await Filemanager.deletePfp(codice);
    const deletedPrivacy = await Filemanager.deletePrivacy(codice);

    res.json(
      Ok({
        deletedRow: dbRes.rows[0],
        deletedFiles: [deletedPfp, deletedPrivacy],
      })
    );
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertProvvisorio(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_PROVV_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.insertProvvisorio(
      reqDataToUpperCase({
        ...parsed.data,
        codice:
          parsed.data.codice ||
          createBarcode(
            parsed.data,
            BadgePrefix.PROVVISORIO,
            parsed.data.cliente
          ),
      })
    );
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok({ insertedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}
export async function apiUpdateProvvisorio(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_PROVV_SCHEMA.safeParse({
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

    const dbRes = await BadgesDB.updateProvvisorio({
      codice,
      updateData: reqDataToUpperCase(updateData),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ updatedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteProvvisorio(req: Request, res: Response) {
  try {
    const parsed = Validator.CODICE_PROV_SCHEMA.safeParse(req.params.codice);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice = parsed.data;

    const dbRes = await BadgesDB.deleteProvvisorio(codice);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ deletedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertChiave(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_CHIAVE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.insertChiave(
      reqDataToUpperCase({
        ...parsed.data,
        codice:
          parsed.data.codice ||
          createBarcode(parsed.data, BadgePrefix.CHIAVE, parsed.data.cliente),
      })
    );
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok({ insertedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}
export async function apiUpdateChiave(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_CHIAVE_SCHEMA.safeParse({
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

    const dbRes = await BadgesDB.updateChiave({
      codice,
      updateData: reqDataToUpperCase(updateData),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ updatedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteChiave(req: Request, res: Response) {
  try {
    const parsed = Validator.CODICE_CHIAVE_SCHEMA.safeParse(req.params.codice);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice = parsed.data;

    const dbRes = await BadgesDB.deleteChiave(codice);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ deletedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertVeicolo(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_VEICOLO_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.insertVeicolo({
      ...parsed.data,
      codice:
        parsed.data.codice ||
        createBarcode(parsed.data, BadgePrefix.VEICOLO, parsed.data.cliente),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok({ insertedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdateVeicolo(req: Request, res: Response) {
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

    const dbRes = await BadgesDB.updateVeicolo({
      codice,
      updateData: reqDataToUpperCase(updateData),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ updatedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteVeicolo(req: Request, res: Response) {
  try {
    const parsed = Validator.CODICE_VEICOLO_SCHEMA.safeParse(req.params.codice);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const codice = parsed.data;

    const dbRes = await BadgesDB.deleteVeicolo(codice);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice },
      });
    }

    res.json(Ok({ deletedRow: dbRes.rows[0] }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetPersone(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_PERSONE_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await BadgesDB.getPersone(reqDataToUpperCase(parsed.data));
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertPersona(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_PERSONA_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { ndoc, tdoc } = parsed.data;

    const dbRes = await BadgesDB.insertPersona(reqDataToUpperCase(parsed.data));
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire persona", {
        status: 500,
        context: { ndoc, tdoc },
      });
    }

    let uploadedFile;
    const docFile =
      req.files?.documento &&
      (Array.isArray(req.files.documento)
        ? req.files.documento[0]
        : req.files.documento);
    if (docFile) {
      uploadedFile = await Filemanager.uploadDocumento(ndoc, docFile);
    }

    res.json(Ok({ insertedRow: dbRes.rows[0], uploadedFile }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}
export async function apiUpdatePersona(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_PERSONA_SCHEMA.safeParse({
      docInfo: req.params,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { docInfo } = parsed.data;

    const dbRes = await BadgesDB.updatePersona({
      docInfo,
      updateData: reqDataToUpperCase(parsed.data.updateData),
    });

    let uploadedFile;
    const docFile =
      req.files?.documento &&
      (Array.isArray(req.files.documento)
        ? req.files.documento[0]
        : req.files.documento);
    if (docFile) {
      uploadedFile = await Filemanager.uploadDocumento(docInfo.ndoc, docFile);
    }

    if (dbRes.rowCount === 0 && !uploadedFile) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { ...docInfo },
      });
    }

    res.json(Ok({ updatedRow: dbRes.rows[0], uploadedFile }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeletePersona(req: Request, res: Response) {
  try {
    const parsed = Validator.PERSONA_DOC_SCHEMA.safeParse(req.params);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const { ndoc, tdoc } = parsed.data;

    const dbRes = await BadgesDB.deletePersona({ ndoc, tdoc });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare persona", {
        status: 500,
        context: { ndoc, tdoc },
      });
    }

    const deletedFile = await Filemanager.deleteDocumento(ndoc, tdoc);

    res.json(Ok({ deletedRow: dbRes.rows[0], deletedFile }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetAssegnazioni(req: Request, res: Response) {
  try {
    const dbRes = await BadgesDB.getAssegnazioni();
    res.json(Ok(dbRes.rows.map(({ value }) => value)));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetEdifici(req: Request, res: Response) {
  try {
    const dbRes = await BadgesDB.getEdifici();
    res.json(Ok(dbRes.rows.map(({ value }) => value)));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetTVeicoli(req: Request, res: Response) {
  try {
    const dbRes = await BadgesDB.getTVeicoli();
    res.json(Ok(dbRes.rows.map(({ value }) => value)));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

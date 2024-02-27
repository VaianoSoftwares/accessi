import { Request, Response } from "express";
import * as BadgesDB from "../db/badges.js";
import { Err, Ok } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import * as Validator from "../utils/validation.js";
import { BaseError } from "../types/errors.js";
import createBarcode from "../utils/barcodeGen.js";
import { BadgePrefix, TDoc } from "../types/badges.js";
import * as Filemanager from "../files/badges.js";

export async function apiGetBadges(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_BADGES_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbRes = await BadgesDB.getBadges(parsed.data);
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

    const dbRes = await BadgesDB.insertNominativo({
      ...parsed.data,
      codice,
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice },
      });
    }

    const pfp =
      req.files?.pfp &&
      (Array.isArray(req.files.pfp) ? req.files.pfp[0] : req.files.pfp);
    if (pfp) {
      await Filemanager.uploadPfp(codice, pfp);
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdateNominativo(req: Request, res: Response) {
  try {
    const { codice } = req.params;
    const parsed = Validator.UPDATE_NOM_SCHEMA.safeParse({
      codice,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.updateNominativo(codice, parsed.data);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    const pfp =
      req.files?.pfp &&
      (Array.isArray(req.files.pfp) ? req.files.pfp[0] : req.files.pfp);
    if (pfp) {
      await Filemanager.uploadPfp(codice, pfp);
    }

    res.json(Ok(dbRes));
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

    await Filemanager.deletePfp(codice);

    res.json(Ok(dbRes));
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

    const dbRes = await BadgesDB.insertProvvisorio({
      ...parsed.data,
      codice:
        parsed.data.codice ||
        createBarcode(
          parsed.data,
          BadgePrefix.PROVVISORIO,
          parsed.data.cliente
        ),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}
export async function apiUpdateProvvisorio(req: Request, res: Response) {
  try {
    const { codice } = req.params;
    const parsed = Validator.UPDATE_PROVV_SCHEMA.safeParse({
      codice,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.updateProvvisorio(codice, parsed.data);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok(dbRes));
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

    res.json(Ok(dbRes));
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

    const dbRes = await BadgesDB.insertChiave({
      ...parsed.data,
      codice:
        parsed.data.codice ||
        createBarcode(parsed.data, BadgePrefix.CHIAVE, parsed.data.cliente),
    });
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile eliminare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}
export async function apiUpdateChiave(req: Request, res: Response) {
  try {
    const { codice } = req.params;
    const parsed = Validator.UPDATE_CHIAVE_SCHEMA.safeParse({
      codice,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.updateChiave(codice, parsed.data);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok(dbRes));
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

    res.json(Ok(dbRes));
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

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdateVeicolo(req: Request, res: Response) {
  try {
    const { codice } = req.params;
    const parsed = Validator.UPDATE_VEICOLO_SCHEMA.safeParse({
      codice,
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.updateVeicolo(codice, parsed.data);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare badge", {
        status: 500,
        context: { codice: parsed.data.codice },
      });
    }

    res.json(Ok(dbRes));
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

    res.json(Ok(dbRes));
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
    const dbRes = await BadgesDB.getPersone(parsed.data);
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

    const dbRes = await BadgesDB.insertPersona(parsed.data);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile inserire persona", {
        status: 500,
        context: { ndoc, tdoc },
      });
    }

    const docFile =
      req.files?.documento &&
      (Array.isArray(req.files.documento)
        ? req.files.documento[0]
        : req.files.documento);
    if (docFile) {
      await Filemanager.uploadDocumento(ndoc, docFile);
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}
export async function apiUpdatePersona(req: Request, res: Response) {
  try {
    const { ndoc, tdoc } = req.params;
    const parsed = Validator.UPDATE_PERSONA_SCHEMA.safeParse({
      docInfo: { ndoc, tdoc },
      updateData: req.body,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbRes = await BadgesDB.updatePersona(
      { ndoc, tdoc: tdoc as TDoc },
      {
        ...parsed.data,
        tdoc:
          parsed.data.updateData.tdoc && (parsed.data.updateData.tdoc as TDoc),
      }
    );
    if (dbRes.rowCount === 0) {
      throw new BaseError("Impossibile modificare persona", {
        status: 500,
        context: { ndoc, tdoc },
      });
    }

    const docFile =
      req.files?.documento &&
      (Array.isArray(req.files.documento)
        ? req.files.documento[0]
        : req.files.documento);
    if (docFile) {
      await Filemanager.uploadDocumento(ndoc, docFile);
    }

    res.json(Ok(dbRes));
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

    await Filemanager.deleteDocumento(ndoc, tdoc);

    res.json(Ok(dbRes));
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

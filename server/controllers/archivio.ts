import { Request, Response } from "express";
import * as ArchivioDB from "../db/archivio.js";
import * as BadgesDB from "../db/badges.js";
import { Err, Ok } from "../_types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { BaseError } from "../_types/errors.js";
import * as Validator from "../utils/validation.js";
import { BarcodePrefix } from "../_types/archivio.js";

export async function apiGetArchivio(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_ARCHIVIO_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbResult = await ArchivioDB.getArchivio(parsed.data);
    res.json(Ok(dbResult.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetInStrutt(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_IN_STRUTT_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbResult = await ArchivioDB.getInStrutt(parsed.data);
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
    const dbResult = await ArchivioDB.getInPrestito(parsed.data);
    res.json(Ok(dbResult.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraBadge(req: Request, res: Response) {
  try {
    const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const barcodePrefix = parsed.data.badge.substring(0, 2);

    const timbraData = {
      ...parsed.data,
      badge: parsed.data.badge.substring(1),
      ip: req.ip,
    };

    const isEntrata = barcodePrefix.startsWith("0");
    if (isEntrata) {
      const isBadgeValid = await BadgesDB.getNominativoByCodice(
        timbraData.badge
      );
      if (isBadgeValid.rowCount !== 1) {
        throw new BaseError("Badge non valido", {
          status: 400,
          context: { badge: timbraData.badge },
        });
      }
    }

    let dbRes;
    switch (barcodePrefix) {
      case BarcodePrefix.provvisorioEntra:
        dbRes = await ArchivioDB.timbraEntrataProvvisorio(timbraData.badge);
        break;
      case BarcodePrefix.provvisorioEsce:
        dbRes = await ArchivioDB.timbraUscitaProvvisorio(timbraData.badge);
        break;
      case BarcodePrefix.nominativoEntra:
        dbRes = await ArchivioDB.timbraEntrataNominativo(timbraData);
        break;
      case BarcodePrefix.nominativoEsce:
        dbRes = await ArchivioDB.timbraUscitaNominativo(timbraData.badge);
        break;
      case BarcodePrefix.veicoloEntra:
        dbRes = await ArchivioDB.timbraEntrataVeicolo(timbraData);
        break;
      case BarcodePrefix.veicoloEsce:
        dbRes = await ArchivioDB.timbraUscitaVeicolo(timbraData.badge);
        break;
    }

    res.json(Ok({ ...dbRes, isEntrata }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraChiavi(req: Request, res: Response) {
  try {
    const parsed = Validator.TIMBRA_CHIAVI_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const timbraData = {
      ...parsed.data,
      badge: parsed.data.badge.substring(1),
      chiavi: Array.from(new Set(parsed.data.chiavi)),
      ip: req.ip,
    };

    const dbRes = await ArchivioDB.timbraChiavi(timbraData);

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraEntrataNominativo(req: Request, res: Response) {
  try {
    const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbResult = await ArchivioDB.timbraEntrataNominativo({
      ...parsed.data,
      badge: parsed.data.badge.substring(1),
      ip: req.ip,
    });

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraUscitaNominativo(req: Request, res: Response) {
  try {
    const badge = String(req.body.badge);
    if (!String(badge).startsWith("10"))
      throw new BaseError("Barcode non valido", { status: 400 });

    const dbResult = await ArchivioDB.timbraUscitaNominativo(
      badge.substring(1)
    );

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraEntrataVeicolo(req: Request, res: Response) {
  try {
    const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbResult = await ArchivioDB.timbraEntrataVeicolo({
      ...parsed.data,
      badge: parsed.data.badge.substring(1),
      ip: req.ip,
    });

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraUscitaVeicolo(req: Request, res: Response) {
  try {
    const badge = String(req.body.badge);
    if (!String(badge).startsWith("13"))
      throw new BaseError("Barcode non valido", { status: 400 });

    const dbResult = await ArchivioDB.timbraUscitaVeicolo(badge.substring(1));

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiInsertProvvisorio(req: Request, res: Response) {
  try {
    const parsed = Validator.INSERT_ARCH_PROV_SCHEMA.safeParse({
      ...req.body,
      ip: req.ip,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const dbResult = await ArchivioDB.insertProvvisorio({
      ...parsed.data,
      badge: parsed.data.badge.substring(1),
    });

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraEntrataProvvisorio(req: Request, res: Response) {
  try {
    const badge = String(req.body.badge);
    if (!String(badge).startsWith("01"))
      throw new BaseError("Barcode non valido", { status: 400 });

    const dbResult = await ArchivioDB.timbraEntrataProvvisorio(
      badge.substring(1)
    );

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiTimbraUscitaProvvisorio(req: Request, res: Response) {
  try {
    const badge = String(req.body.badge);
    if (!String(badge).startsWith("11"))
      throw new BaseError("Barcode non valido", { status: 400 });

    const dbResult = await ArchivioDB.timbraUscitaProvvisorio(
      badge.substring(1)
    );

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

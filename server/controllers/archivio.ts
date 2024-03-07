import { Request, Response } from "express";
import * as ArchivioDB from "../db/archivio.js";
import { Err, Ok } from "../types/index.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { BaseError } from "../types/errors.js";
import * as Validator from "../utils/validation.js";
import { Archivio, BarcodePrefix } from "../types/archivio.js";
import { objToUpperCase } from "../utils/objToUpperCase.js";

function reqDataToUpperCase<T extends object>(data: T) {
  return objToUpperCase(data, ["cliente", "postazione"] satisfies Array<
    keyof Archivio
  >);
}

export async function apiGetArchivio(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_ARCHIVIO_SCHEMA.safeParse(req.query);
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

export async function apiGetInStrutt(req: Request, res: Response) {
  try {
    const parsed = Validator.FIND_IN_STRUTT_SCHEMA.safeParse(req.query);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }
    const dbResult = await ArchivioDB.getInStrutt(
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
    const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const barcodeType =
      parsed.data.badge.length === 10
        ? parsed.data.badge.substring(0, 2)
        : "UNI";

    const timbraData = {
      ...parsed.data,
      badge:
        barcodeType === "UNI"
          ? parsed.data.badge
          : parsed.data.badge.substring(1),
      ip: req.ip,
    };

    let dbRes;
    switch (barcodeType) {
      case BarcodePrefix.provvisorioEntra:
        dbRes = await ArchivioDB.timbraEntrataProvvisorio(timbraData);
        break;
      case BarcodePrefix.provvisorioEsce:
        dbRes = await ArchivioDB.timbraUscitaProvvisorio(timbraData);
        break;
      case BarcodePrefix.nominativoEntra:
        dbRes = await ArchivioDB.timbraEntrataNominativo(timbraData);
        break;
      case BarcodePrefix.nominativoEsce:
        dbRes = await ArchivioDB.timbraUscitaNominativo(timbraData);
        break;
      case BarcodePrefix.veicoloEntra:
        dbRes = await ArchivioDB.timbraEntrataVeicolo(timbraData);
        break;
      case BarcodePrefix.veicoloEsce:
        dbRes = await ArchivioDB.timbraUscitaVeicolo(timbraData);
        break;
      case "UNI":
        dbRes = await ArchivioDB.timbraUniversitario({
          postazione: timbraData.postazione,
          ip: timbraData.ip,
          ndoc: timbraData.badge,
        });
        break;
      default:
        throw new BaseError("Prefisso Barcode non valido", {
          status: 400,
          context: { badge: timbraData.badge },
        });
    }

    res.json(Ok(dbRes));
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
      ip: req.ip,
    });

    res.json(Ok(dbRes));
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

    const dbResult = await ArchivioDB.insertProvvisorio(
      reqDataToUpperCase({
        ...parsed.data,
        badge:
          parsed.data.badge.length === 10
            ? parsed.data.badge.substring(1)
            : parsed.data.badge,
      })
    );

    res.json(Ok(dbResult));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error.message);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

// export async function apiTimbraEntrataNominativo(req: Request, res: Response) {
//   try {
//     const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse(req.body);
//     if (parsed.success === false) {
//       throw new BaseError(parsed.error.errors[0].message, {
//         status: 400,
//         cause: parsed.error,
//       });
//     }

//     const dbResult = await ArchivioDB.timbraEntrataNominativo({
//       ...parsed.data,
//       badge: parsed.data.badge.substring(1),
//       ip: req.ip,
//     });

//     res.json(Ok(dbResult));
//   } catch (e) {
//     const error = enforceBaseErr(e);
//     console.error(error.message);
//     res.status(error.status).json(Err(error.toJSON()));
//   }
// }

// export async function apiTimbraUscitaNominativo(req: Request, res: Response) {
//   try {
//     const badge = String(req.body.badge);
//     if (!String(badge).startsWith("10"))
//       throw new BaseError("Barcode non valido", { status: 400 });

//     const dbResult = await ArchivioDB.timbraUscitaNominativo({
//       badge: badge.substring(1),
//       postazione: 1,
//     });

//     res.json(Ok(dbResult));
//   } catch (e) {
//     const error = enforceBaseErr(e);
//     console.error(error.message);
//     res.status(error.status).json(Err(error.toJSON()));
//   }
// }

// export async function apiTimbraEntrataVeicolo(req: Request, res: Response) {
//   try {
//     const parsed = Validator.TIMBRA_BADGE_SCHEMA.safeParse(req.body);
//     if (parsed.success === false) {
//       throw new BaseError(parsed.error.errors[0].message, {
//         status: 400,
//         cause: parsed.error,
//       });
//     }

//     const dbResult = await ArchivioDB.timbraEntrataVeicolo({
//       ...parsed.data,
//       badge: parsed.data.badge.substring(1),
//       ip: req.ip,
//     });

//     res.json(Ok(dbResult));
//   } catch (e) {
//     const error = enforceBaseErr(e);
//     console.error(error.message);
//     res.status(error.status).json(Err(error.toJSON()));
//   }
// }

// export async function apiTimbraUscitaVeicolo(req: Request, res: Response) {
//   try {
//     const badge = String(req.body.badge);
//     if (!String(badge).startsWith("13"))
//       throw new BaseError("Barcode non valido", { status: 400 });

//     const dbResult = await ArchivioDB.timbraUscitaVeicolo({
//       badge: badge.substring(1),
//       postazione: 1,
//     });

//     res.json(Ok(dbResult));
//   } catch (e) {
//     const error = enforceBaseErr(e);
//     console.error(error.message);
//     res.status(error.status).json(Err(error.toJSON()));
//   }
// }

// export async function apiTimbraEntrataProvvisorio(req: Request, res: Response) {
//   try {
//     const badge = String(req.body.badge);
//     if (!String(badge).startsWith("01"))
//       throw new BaseError("Barcode non valido", { status: 400 });

//     const dbResult = await ArchivioDB.timbraEntrataProvvisorio({
//       badge: badge.substring(1),
//       postazione: 1,
//     });

//     res.json(Ok(dbResult));
//   } catch (e) {
//     const error = enforceBaseErr(e);
//     console.error(error.message);
//     res.status(error.status).json(Err(error.toJSON()));
//   }
// }

// export async function apiTimbraUscitaProvvisorio(req: Request, res: Response) {
//   try {
//     const badge = String(req.body.badge);
//     if (!String(badge).startsWith("11"))
//       throw new BaseError("Barcode non valido", { status: 400 });

//     const dbResult = await ArchivioDB.timbraUscitaProvvisorio({
//       badge: badge.substring(1),
//       postazione: 1,
//     });

//     res.json(Ok(dbResult));
//   } catch (e) {
//     const error = enforceBaseErr(e);
//     console.error(error.message);
//     res.status(error.status).json(Err(error.toJSON()));
//   }
// }

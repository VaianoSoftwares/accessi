import { NextFunction, Request, Response } from "express";
import * as Validator from "../utils/validation.js";
import * as UsersDB from "../db/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { Err, Ok } from "../types/index.js";
import { BaseError } from "../types/errors.js";

async function login(
  req: Request,
  res: Response,
  next: NextFunction,
  expiresIn: string | number
) {
  try {
    const parsed = Validator.LOGIN_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError("Username/Password non validi", {
        status: 400,
        cause: parsed.error,
      });
    }

    const { name, password } = parsed.data;

    const dbResult = await UsersDB.getUserByName(name);
    if (dbResult.rowCount === 0)
      throw new BaseError("Username/Password non validi", { status: 400 });

    const user = dbResult.rows[0];

    const isPswValid = await bcrypt.compare(password, user.password);
    if (!isPswValid)
      throw new BaseError("Username/Password non validi", { status: 400 });

    const secret = process.env.TOKEN_SECRET!;

    jwt.sign(
      { id: user.id, date: Date.now() },
      secret,
      { expiresIn },
      (err, token) => {
        if (err) {
          return next(
            new BaseError("Impossibile eseguire login", {
              status: 500,
              cause: err,
            })
          );
        }

        console.log(name, "logged in.");

        res
          .header("x-access-token", token)
          .json(Ok({ ...user, password: undefined }));
      }
    );
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return await login(req, res, next, "1d");
}

export async function apiTmpLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return await login(req, res, next, "5m");
}

export function apiRefreshLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const secret = process.env.TOKEN_SECRET!;
    console.log("refreshlog", user);
    jwt.sign(
      { id: user.id, date: Date.now() },
      secret,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          return next(
            new BaseError("Impossibile eseguire login", {
              status: 500,
              cause: err,
            })
          );
        }

        console.log(user.name, "logged in.");

        res
          .header("x-access-token", token)
          .json(Ok({ ...user, password: undefined }));
      }
    );
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetAllUsers(req: Request, res: Response) {
  try {
    const dbRes = await UsersDB.getAllUsers();
    res.json(Ok(dbRes.rows));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiGetUserById(req: Request, res: Response) {
  try {
    const userId = Number.parseInt(req.params.id);
    if (Number.isNaN(userId)) {
      throw new BaseError("User ID non valido o mancante", {
        status: 400,
        context: { userId },
      });
    }

    const dbRes = await UsersDB.getUserById(userId);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Utente non trovato", {
        status: 400,
        context: { userId },
      });
    }

    res.json(Ok({ ...dbRes.rows[0], password: undefined }));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiRegister(req: Request, res: Response) {
  try {
    const parsed = Validator.REGISTER_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const nameExistsRes = await UsersDB.getUserByName(parsed.data.name);
    if (nameExistsRes.rowCount !== 0) {
      throw new BaseError("Username non disponibile", {
        status: 400,
        context: { name: parsed.data.name },
      });
    }

    if (parsed.data.password) {
      const salt = await bcrypt.genSalt(10);
      const hashPsw = await bcrypt.hash(parsed.data.password, salt);
      parsed.data.password = hashPsw;
    }

    const dbRes = await UsersDB.addUser(parsed.data);

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdateUser(req: Request, res: Response) {
  try {
    const parsed = Validator.UPDATE_USER_SCHEMA.safeParse({
      updateValues: req.body,
      id: req.params.id,
    });
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const password = parsed.data.updateValues.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPsw = await bcrypt.hash(password, salt);
      parsed.data.updateValues.password = hashPsw;
    }

    const dbRes = await UsersDB.updateUser(parsed.data);
    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiUpdatePostazioniUser(req: Request, res: Response) {
  try {
    const parsed = Validator.UPD_POST_USR_SCHEMA.safeParse(req.body);
    if (parsed.success === false) {
      throw new BaseError(parsed.error.errors[0].message, {
        status: 400,
        cause: parsed.error,
      });
    }

    const userId = Number.parseInt(req.params.id);
    if (Number.isNaN(userId)) {
      throw new BaseError("User ID non valido o mancante", {
        status: 400,
        context: { userId },
      });
    }

    const userToUpd = await UsersDB.getUserById(userId);
    if (userToUpd.rowCount !== 0) {
      throw new BaseError("Utente non esiste", {
        status: 400,
        context: { userId },
      });
    }

    const dbRes = await UsersDB.updatePostazioniToUser(parsed.data, userId);

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

export async function apiDeleteUser(req: Request, res: Response) {
  try {
    const userId = Number.parseInt(req.params.id);
    if (Number.isNaN(userId)) {
      throw new BaseError("User ID non valido o mancante", {
        status: 400,
        context: { userId },
      });
    }

    const dbRes = await UsersDB.deleteUser(userId);
    if (dbRes.rowCount === 0) {
      throw new BaseError("Utente non trovato", {
        status: 400,
        context: { userId },
      });
    }

    res.json(Ok(dbRes));
  } catch (e) {
    const error = enforceBaseErr(e);
    console.error(error);
    res.status(error.status).json(Err(error.toJSON()));
  }
}

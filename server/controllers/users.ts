import { NextFunction, Request, Response } from "express";
import * as Validator from "../utils/validation.js";
import UsersDB from "../db/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Ok } from "../types/index.js";
import { BaseError } from "../types/errors.js";
import isLan from "../utils/isLan.js";

const secondsInOneYear = 31536000;

export default class UsersController {
  private static async login(
    req: Request,
    res: Response,
    next: NextFunction,
    expiresInSeconds: number
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
      if (!dbResult.rowCount)
        throw new BaseError("Username/Password non validi", { status: 400 });

      const user = dbResult.rows[0];

      const isPswValid = await bcrypt.compare(password, user.password);
      if (!isPswValid)
        throw new BaseError("Username/Password non validi", { status: 400 });

      const secret = process.env.TOKEN_SECRET!;

      jwt.sign(
        { id: user.id, date: Date.now() },
        secret,
        { expiresIn: expiresInSeconds },
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

          res.cookie("token", token, {
            secure:
              process.env.NODE_ENV != "development" &&
              req.ip !== undefined &&
              !isLan(req.ip),
            httpOnly: true,
            maxAge: expiresInSeconds * 1000,
          });
          res.json(Ok({ ...user, password: undefined }));
        }
      );
    } catch (e) {
      next(e);
    }
  }

  public static async apiLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return await UsersController.login(req, res, next, secondsInOneYear);
  }

  public static async apiTmpLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return await UsersController.login(req, res, next, 60 * 60 * 5 /* 5 min */);
  }

  public static async apiLogout(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.cookies.token;
      if (!token) {
        throw new BaseError("Permessi Insufficienti", { status: 401 });
      }

      console.log(req.user, "logged out");

      res.cookie("token", null, {
        secure:
          process.env.NODE_ENV != "development" &&
          req.ip !== undefined &&
          !isLan(req.ip),
        httpOnly: true,
        maxAge: -1,
      });
      res.status(204).json(Ok(null));
    } catch (e) {
      next(e);
    }
  }

  public static apiRefreshLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user!;
      const secret = process.env.TOKEN_SECRET!;
      jwt.sign(
        { id: user.id, date: Date.now() },
        secret,
        { expiresIn: secondsInOneYear },
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

          res.cookie("token", token, {
            secure:
              process.env.NODE_ENV != "development" &&
              req.ip !== undefined &&
              !isLan(req.ip),
            httpOnly: true,
            maxAge: secondsInOneYear * 1000,
          });
          res.json(Ok({ ...user, password: undefined }));
        }
      );
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dbRes = await UsersDB.getAllUsers();
      res.json(Ok(dbRes.rows));
    } catch (e) {
      next(e);
    }
  }

  public static async apiGetUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = Number.parseInt(req.params.id);
      if (Number.isNaN(userId)) {
        throw new BaseError("User ID non valido o mancante", {
          status: 400,
          context: { userId },
        });
      }

      const dbRes = await UsersDB.getUserById(userId);
      if (!dbRes.rowCount) {
        throw new BaseError("Utente non trovato", {
          status: 400,
          context: { userId },
        });
      }

      res.json(Ok({ ...dbRes.rows[0], password: undefined }));
    } catch (e) {
      next(e);
    }
  }

  public static async apiRegister(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
      next(e);
    }
  }

  public static async apiUpdateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
      next(e);
    }
  }

  public static async apiUpdatePostazioniUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
      next(e);
    }
  }

  public static async apiDeleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = Number.parseInt(req.params.id);
      if (Number.isNaN(userId)) {
        throw new BaseError("User ID non valido o mancante", {
          status: 400,
          context: { userId },
        });
      }

      const dbRes = await UsersDB.deleteUser(userId);
      if (!dbRes.rowCount) {
        throw new BaseError("Utente non trovato", {
          status: 400,
          context: { userId },
        });
      }

      res.json(Ok(dbRes));
    } catch (e) {
      next(e);
    }
  }
}

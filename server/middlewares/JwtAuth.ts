import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as UsersDB from "../db/users.js";
import { BaseError } from "../_types/errors.js";
import { TPermessi, User } from "../_types/users.js";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { Err } from "../_types/index.js";
import { checkBits } from "../utils/bitwise.js";

declare module "jsonwebtoken" {
  interface JwtPayload {
    id?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

export default class JwtAuth {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers["x-access-token"] as string;
      if (!token)
        throw new BaseError("Permessi insufficienti", { status: 403 });

      const secret = process.env.TOKEN_SECRET;
      if (!secret)
        throw new BaseError("Server internal error", { status: 500 });

      jwt.verify(token, secret, async (err, decoded) => {
        if (err || !decoded) {
          throw new BaseError("Permessi insufficienti", { status: 401 });
        }

        const userId = Number.parseInt((decoded as jwt.JwtPayload).id || "");
        if (Number.isNaN(userId)) {
          throw new BaseError("Permessi insufficienti", { status: 500 });
        }

        const { rowCount, rows } = await UsersDB.getUserById(userId);
        if (rowCount === 0)
          throw new BaseError("Permessi insufficienti", { status: 401 });

        req.user = rows[0];

        return next();
      });
    } catch (e) {
      const error = enforceBaseErr(e);
      console.error(error);
      res.status(error.status).json(Err(error));
    }
  }

  private static checkPermessi(
    req: Request,
    res: Response,
    next: NextFunction,
    flags: TPermessi
  ) {
    try {
      const { user } = req;
      if (!user) {
        throw new BaseError("Server interal error", { status: 500 });
      } else if (checkBits(user.permessi, flags)) {
        throw new BaseError("Permessi insufficienti", { status: 401 });
      }

      next();
    } catch (e) {
      const error = enforceBaseErr(e);
      console.error(error);
      res.status(error.status).json(Err(error));
    }
  }

  static isAdmin(req: Request, res: Response, next: NextFunction) {
    return JwtAuth.checkPermessi(req, res, next, TPermessi.admin);
  }

  static isDevice(req: Request, res: Response, next: NextFunction) {
    return JwtAuth.checkPermessi(req, res, next, TPermessi.device);
  }
}

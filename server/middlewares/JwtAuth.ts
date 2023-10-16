import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UsersDAO from "../dao/users.dao.js";
import errCheck from "../utils/errCheck.js";
import { TUser } from "../types/users.js";
import { WithId } from "mongodb";

declare module "jsonwebtoken" {
  interface JwtPayload {
    id?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: WithId<TUser>;
  }
}

export default class JwtAuth {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-access-token"] as string;
    if (!token) {
      return res.status(403).json({
        success: false,
        msg: "Access denied.",
      });
    }

    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        msg: "Server internal error.",
      });
    }

    jwt.verify(token, secret, async (err, decoded) => {
      if (err || !decoded) {
        return res.status(401).json({
          success: false,
          msg: "Access denied.",
        });
      }

      const userId = (decoded as jwt.JwtPayload).id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          msg: "Access denied.",
        });
      }

      try {
        const user = await UsersDAO.getUserById(userId);
        if (!user) {
          return res.status(401).json({
            success: false,
            msg: "Access denied.",
          });
        }

        req.user = user;

        return next();
      } catch (err) {
        const { error } = errCheck(err, "verifyToken |");
        res.status(500).json({ success: false, msg: error });
      }
    });
  }

  static #checkFlag(
    req: Request,
    res: Response,
    next: NextFunction,
    flagName: keyof TUser
  ) {
    const { user } = req;
    if (!user) {
      return res.status(500).json({
        success: false,
        msg: "Server internal error.",
      });
    } else if (!user[flagName]) {
      return res.status(401).json({
        success: false,
        msg: "Access denied.",
      });
    }

    next();
  }

  static isAdmin(req: Request, res: Response, next: NextFunction) {
    return JwtAuth.#checkFlag(req, res, next, "admin");
  }

  static isDevice(req: Request, res: Response, next: NextFunction) {
    return JwtAuth.#checkFlag(req, res, next, "device");
  }
}

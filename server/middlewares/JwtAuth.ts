import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UsersDAO from "../dao/users.dao.js";
import errCheck from "../utils/errCheck.js";

declare module "jsonwebtoken" {
  interface JwtPayload {
    id?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}


export default class JwtAuth {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-access-token"] as string;
    if (!token) {
      return res.status(403).json({
        success: false,
        msg: "No token provided.",
      });
    }

    const secret = process.env.TOKEN_SECRET!;

    jwt.verify(token, secret, (err, decoded) => {
      if (err || !decoded) {
        return res.status(401).json({
          success: false,
          msg: "Access denied.",
        });
      }

      req.userId = (decoded as jwt.JwtPayload).id;

      next();
    });
  }

  static async isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await UsersDAO.getUserById(req.userId!);
        if(!user || user.admin === false) {
            return res.status(401).json({
                success: false,
                msg: "Access denied.",
            });
        }

        next();
    } catch(err) {
        const { error } = errCheck(err, "isAdmin |");
        res.status(500).json({
            success: false,
            msg: error,
        });
    }
  }
}
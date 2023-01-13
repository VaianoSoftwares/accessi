import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import errCheck from "../middlewares/errCheck.js";

export default class AuthToken {
  static verifyGuest(req: Request, res: Response, next: NextFunction) {
    const token = req.header("guest-token");
    if (!token) {
      return res.status(401).json({ success: false, msg: "Access denied." });
    }

    const secret = process.env.GUEST_TOKEN;
    if (!secret) {
      return res.status(401).json({ success: false, msg: "Access denied." });
    }

    try {
      /* const verified = */ jwt.verify(token, secret);
      // req.user = verified;
      next();
    } catch (err) {
      errCheck(err, "verifyGuest | Invalid token.");
      return res.status(401).json({ success: false, msg: "Access denied." });
    }
  }

  static verifyAdmin(req: Request, res: Response, next: NextFunction) {
    const token = req.header("admin-token");
    if (!token) {
      return res.status(401).json({ success: false, msg: "Access denied." });
    }

    const secret = process.env.ADMIN_TOKEN;
    if (!secret) {
      return res.status(401).json({ success: false, msg: "Access denied." });
    }

    try {
      /* const verified = */ jwt.verify(token, secret);
      // req.user = verified;
      next();
    } catch (err) {
      errCheck(err, "verifyAdmin | Invalid token.");
      return res.status(401).json({ success: false, msg: "Access denied." });
    }
  }
}
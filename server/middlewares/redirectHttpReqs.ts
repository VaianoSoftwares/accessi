import { NextFunction, Request, Response } from "express";

export default function redirectHttpReqs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.NODE_ENV != "development" && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

import { NextFunction, Request, Response } from "express";

export default function errorHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.protocol === "http") {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

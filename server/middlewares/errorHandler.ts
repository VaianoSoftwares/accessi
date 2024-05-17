import { NextFunction, Request, Response } from "express";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { Err } from "../types/index.js";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = enforceBaseErr(err);
  console.error(error);
  res.status(error.status).json(Err(error.toJSON()));
}

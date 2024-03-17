import { Request, Response } from "express";
import enforceBaseErr from "../utils/enforceBaseErr.js";
import { Err } from "../types/index.js";

export default function errorHandler(err: any, req: Request, res: Response) {
  const error = enforceBaseErr(err);
  console.error(error);
  res.status(error.status).json(Err(error.toJSON()));
}

import { Request, Response } from "express";

export default function invalidPathHandler(req: Request, res: Response) {
  res.status(404).send("invalid request");
}

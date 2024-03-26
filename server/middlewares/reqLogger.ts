import { NextFunction, Request, Response } from "express";

export default function (req: Request, res: Response, next: NextFunction) {
  console.log(
    `[${new Date().toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
    })}] Request endpoint: ${req.ip} ${req.method} ${req.url}`
  );
  next();
}

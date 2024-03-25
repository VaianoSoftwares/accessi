import { NextFunction, Request, Response } from "express";

const httpPort = process.env.HTTP_PORT || 4316;
const httpsPort = process.env.HTTPS_PORT || 4317;

export default function errorHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.protocol === "http") {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else if (req.headers.host?.endsWith(`:${httpPort}`)) {
    const sepatorIndex = req.headers.host?.indexOf(":") || -1;
    const newHost = [
      sepatorIndex < 0
        ? req.headers.host
        : req.headers.host?.substring(0, sepatorIndex),
      ":",
      String(httpsPort),
    ].join("");

    res.redirect(301, `https://${newHost}${req.url}`);
  }
  next();
}

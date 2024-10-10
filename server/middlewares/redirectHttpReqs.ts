import { NextFunction, Request, Response } from "express";
import isLan from "../utils/isLan.js";

export default function redirectHttpReqs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secure = process.env.NODE_ENV != "development" && !isLan(req.ip || "");
  if (req.secure && !secure) {
    const urlTokens = req.headers.host?.split(":");
    if (urlTokens?.length === 2 && urlTokens[1] == process.env.HTTPS_PORT) {
      return res.redirect(
        301,
        `http://${urlTokens[0]}:${process.env.HTTP_PORT}${req.url}`
      );
    }
    return res.redirect(301, `http://${req.headers.host}${req.url}`);
  } else if (!req.secure && secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

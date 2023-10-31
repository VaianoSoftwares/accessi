import { NextFunction, Request, Response } from "express";

export default class IgnoredReqs {
  static favicon(req: Request, res: Response, next: NextFunction) {
    if (
      req.originalUrl &&
      req.originalUrl.split("/").pop()?.includes("favicon")
    ) {
      return res.sendStatus(204);
    }

    next();
  }

  static optionsMethod(req: Request, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  }

  static home(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl && req.originalUrl.includes("/home")) {
      return res.sendStatus(204);
    }

    next();
  }
}

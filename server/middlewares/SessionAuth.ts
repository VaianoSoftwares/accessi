import { Request, Response, NextFunction } from "express";

export default class SessionAuth {
    static isLogged(req: Request, res: Response, next: NextFunction) {
        // if(!req.session.user) {
        //     return res.status(401).json({
        //         success: false,
        //         msg: "Access denied."
        //     });
        // }

        next();
    }

    static isAdmin(req: Request, res: Response, next: NextFunction) {
        // if(!req.session.user?.admin) {
        //     return res.status(401).json({
        //         success: false,
        //         msg: "Access denied."
        //     });
        // }

        next();
    }
}
import UsersDAO from "../dao/users.dao.js";
import Validator from "./validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import errCheck from "../utils/errCheck.js";
import { TUser } from "../types/users.js";
// import SessionUser from "../types/SessionUser.js";
// import SessionsDAO from "../dao/sessions.dao.js";

export default class UsersController {
  static async apiRegister(req: Request, res: Response) {
    const { error } = Validator.register(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, msg: error.details[0].message, data: null });
    }

    const admin = (req.body.admin as boolean) || false;

    const { username, password, clienti, postazioni } = req.body;

    try {
      if (
        !admin &&
        (!Array.isArray(clienti) ||
          clienti.length === 0 ||
          !Array.isArray(postazioni) ||
          postazioni.length === 0)
      ) {
        throw new Error("Clienti/Postazioni non forniti");
      }

      const salt = await bcrypt.genSalt(10);
      const hashPsw = await bcrypt.hash(password as string, salt);

      const userDoc: TUser = {
        username: username as string,
        password: hashPsw,
        admin,
        clienti: admin ? null : clienti as string[],
        postazioni: admin ? null : postazioni as string[],
      };

      const response = await UsersDAO.addUser(userDoc);
      if ("error" in response) {
        return res
          .status(400)
          .json({ success: false, msg: response.error, data: null });
      }

      res.json({
        success: true,
        msg: "Utente registrato con successo",
        data: response.insertedId,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiRegister |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiLogin(req: Request, res: Response) {
    const { error } = Validator.login(req.body);

    if (error) {
      console.log("apiLogin |", error);
      return res
        .status(400)
        .json({ success: false, msg: error.details[0].message, data: null });
    }

    const { username, password } = req.body;

    try {
      const user = await UsersDAO.getUserByName(username);
      if (!user) {
        throw new Error("Username/Password non validi.");
      }

      const userId = user._id.toString();

      // const [alreadyLogged] = await SessionsDAO.getSessions({ id: userId });
      // if (alreadyLogged && alreadyLogged._id.toString() !== req.sessionID) {
      //   throw new Error(`Utente ${user.username} già loggato.`);
      // }

      const isPswValid = await bcrypt.compare(password, user.password);
      if (!isPswValid) {
        throw new Error("Username/Password non validi.");
      }

      const secret = process.env.TOKEN_SECRET!;
      jwt.sign({ id: userId }, secret, {}, (err, token) => {
        if (err) {
          throw err;
        }

        console.log(username, "logged in.");

        res.header("x-access-token", token).json({
          success: true,
          msg: "Login effettuato",
          data: {
            id: userId,
            name: user.username,
            admin: user.admin,
            clienti: user.clienti,
            postazioni: user.postazioni,
          },
        });
      });

      // req.session.regenerate((err) => {
      //   if (err) {
      //     throw new Error(err);
      //   }

      //   req.session.user = {
      //     id: userId,
      //     username,
      //     admin: user.admin,
      //     cliente,
      //     postazione,
      //     token,
      //   };

      //   req.session.save((err) => {
      //     if (err) {
      //       throw new Error(err);
      //     }

      //     console.log(`${username} logged in.`);

      //     res.header("x-access-token", token).json({
      //       success: true,
      //       msg: "Login effettuato",
      //       data: {
      //         id: userId,
      //         name: user.username,
      //         admin: user.admin,
      //       },
      //     });
      //   });
      // });
    } catch (err) {
      const { error } = errCheck(err, "apiLogin |");
      res.status(400).json({ success: false, msg: error, data: null });
    }
  }

  static async apiLogout(req: Request, res: Response) {
    // req.session.user = null;
    // req.session.save((err) => {
    //   if (err) {
    //     const { error } = errCheck(err, "apiLogout |");
    //     return res.status(400).json({ success: false, msg: error, data: null });
    //   }
    //   req.session.regenerate((err) => {
    //     if (err) {
    //       const { error } = errCheck(err, "apiLogout |");
    //       return res
    //         .status(400)
    //         .json({ success: false, msg: error, data: null });
    //     }
    //     console.log("Logout effettuato.");
    //     return res.json({
    //       success: true,
    //       msg: "Logout effettuato",
    //       data: null,
    //     });
    //   });
    // });
  }

  static async apiGetUser(req: Request, res: Response) {
    const { error } = Validator.login(req.body);

    if (error) {
      console.log("apiGetUser |", error);
      return res
        .status(400)
        .json({ success: false, msg: error.details[0].message, data: null });
    }

    try {
      const user = await UsersDAO.getUserById(req.query.id as string);
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found" });
      }
      res.json({ success: true, msg: "User has been found", data: user });
    } catch (err) {
      const { error } = errCheck(err, "getUser |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiGetSession(req: Request, res: Response) {
    // if (!req.session.user) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: "Session ID non valido",
    //   });
    // }
    // res.json({
    //   success: true,
    //   msg: "Info sessione ottenute con successo",
    //   data: {
    //     name: req.session.user.username,
    //     admin: req.session.user.admin,
    //     cliente: req.session.user.cliente,
    //     postazione: req.session.user.postazione,
    //   },
    // });
  }
}
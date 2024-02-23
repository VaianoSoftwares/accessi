import UsersDAO from "../dao/users.dao.js";
import Validator from "./validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import errCheck from "../utils/errCheck.js";
import { TUser } from "../types/users.js";
import { ObjectId } from "mongodb";

export default class UsersController {
  static async apiRegister(req: Request, res: Response) {
    console.log("apiRegister | req.body:", req.body);
    const parsed = Validator.register(req.body);
    console.log("apiRegister | parsed:", parsed);

    if (parsed.success === false) {
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.errors[0].message });
    }

    const { password, postazioni } = parsed.data;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashPsw = await bcrypt.hash(password, salt);

      const userDoc: TUser = {
        ...parsed.data,
        password: hashPsw,
        admin: false,
        postazioni: postazioni.map((p) => new ObjectId(p)),
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

  static async apiGetUserById(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const user = await UsersDAO.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "Utente non trovato",
        });
      }

      res.json({
        success: true,
        msg: "Utente ottenuto con successo",
        data: { ...user, password: "" },
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetUserById |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiUpdateUser(req: Request, res: Response) {
    const { userId } = req.params;

    const parsed = Validator.updateUser(req.body);

    if (parsed.success === false) {
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.errors[0].message });
    }

    const user = parsed.data as Partial<TUser>;
    user.postazioni =
      parsed.data.postazioni &&
      parsed.data.postazioni.map((p) => new ObjectId(p));
    user.password = user.password || undefined;

    try {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      const response = await UsersDAO.updateUser(userId, user);
      if ("error" in response) {
        return res.status(400).json({ success: false, msg: response.error });
      }

      res.json({
        success: true,
        msg: "Utente aggiornato con successo",
        data: { updatedId: userId, ...response },
      });
    } catch (err) {
      const { error } = errCheck(err, "apiUpdateUser |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiDeleteUser(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const response = await UsersDAO.deleteUser(userId);
      if ("error" in response) {
        return res.status(400).json({ success: false, msg: response.error });
      }

      res.json({
        success: true,
        msg: "Utente eliminato con successo",
        data: response,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiDeleteUser |");
      res.status(500).json({ success: false, msg: error });
    }
  }

  static async apiGetAllUsers(req: Request, res: Response) {
    try {
      const users = await UsersDAO.getAllUsers();
      if (users.length <= 0) {
        return res.status(404).json({
          success: false,
          msg: "Nessun utente trovato",
        });
      }

      res.json({
        success: true,
        msg: "Ottenuti utenti con successo",
        data: users,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetAllUsers |");
      res.status(500).json({ success: false, msg: error, data: [] });
    }
  }

  static async apiLogin(req: Request, res: Response) {
    return await UsersController.#login(req, res, "1d");
  }

  static async apiTmpLogin(req: Request, res: Response) {
    return await UsersController.#login(req, res, 20);
  }

  static async #login(req: Request, res: Response, expiresIn: string | number) {
    const parsed = Validator.login(req.body);
    if (parsed.success === false) {
      return res
        .status(400)
        .json({ success: false, msg: "Username/Password non validi." });
    }

    const { username, password } = parsed.data;

    try {
      const user = await UsersDAO.getUserByName(username);
      if (!user) {
        throw new Error("Username/Password non validi.");
      }

      const userId = user._id.toString();

      const isPswValid = await bcrypt.compare(password, user.password);
      if (!isPswValid) {
        throw new Error("Username/Password non validi.");
      }

      const secret = process.env.TOKEN_SECRET!;
      jwt.sign(
        { id: userId, date: Date.now() },
        secret,
        { expiresIn },
        (err, token) => {
          if (err) {
            throw err;
          }

          console.log(username, "logged in.");

          res.header("x-access-token", token).json({
            success: true,
            msg: "Login effettuato",
            data: { ...user, password: "" },
          });
        }
      );
    } catch (err) {
      const { error } = errCheck(err, "apiLogin |");
      res.status(400).json({ success: false, msg: error, data: null });
    }
  }

  static apiRefreshLogin(req: Request, res: Response) {
    try {
      const user = req.user!;
      const secret = process.env.TOKEN_SECRET!;

      jwt.sign(
        { id: user._id, date: Date.now() },
        secret,
        { expiresIn: "1d" },
        (err, token) => {
          if (err) {
            throw err;
          }

          console.log(user.username, "logged in.");

          res.header("x-access-token", token).json({
            success: true,
            msg: "Login effettuato",
            data: { ...user, password: "" },
          });
        }
      );
    } catch (err) {
      const { error } = errCheck(err, "apiRefreshLogin |");
      res.status(500).json({ success: false, msg: error });
    }
  }
}

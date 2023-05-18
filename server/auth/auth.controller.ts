import UsersDAO from "../dao/users.dao.js";
import Validator from "./validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import errCheck from "../utils/errCheck.js";
import { TUser, TUserResp } from "../types/users.js";
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

    const { username, password, postazioni, pages, device, canLogout } =
      parsed.data;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashPsw = await bcrypt.hash(password, salt);

      const userDoc: TUser = {
        username,
        password: hashPsw,
        admin: false,
        postazioni: postazioni.map((p) => new ObjectId(p)),
        pages,
        device: !device ? null : device,
        canLogout,
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
      const response = await UsersDAO.getUserById(userId);
      res.json({
        success: true,
        msg: "Utente ottenuto con successo",
        data: response,
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
      const response = await UsersDAO.getAllUsers();
      res.json({
        success: true,
        msg: "Ottenuti utenti con successo",
        data: response,
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetAllUsers |");
      res.status(500).json({ success: false, msg: error, data: [] });
    }
  }

  static async apiLogin(req: Request, res: Response) {
    const parsed = Validator.login(req.body);

    if (parsed.success === false) {
      console.log("apiLogin |", parsed.error);
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.errors[0].message });
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
            username: user.username,
            admin: user.admin,
            postazioni: user.postazioni,
            pages: user.pages,
            canLogout: user.canLogout,
          } satisfies TUserResp,
        });
      });
    } catch (err) {
      const { error } = errCheck(err, "apiLogin |");
      res.status(400).json({ success: false, msg: error, data: null });
    }
  }

  static async apiGetUserWithDevice(req: Request, res: Response) {
    const { device, password } = req.body;
    if (!device || !password) {
      return res
        .status(404)
        .json({ success: false, msg: "Device/Password non validi." });
    }

    try {
      const user = await UsersDAO.getUserByDevice(device as string);
      if (!user) {
        throw new Error("Device/Password non validi.");
      }

      const isPswValid = await bcrypt.compare(
        password as string,
        user.password
      );
      if (!isPswValid) {
        throw new Error("Device/Password non validi.");
      }

      const secret = process.env.TOKEN_SECRET!;
      jwt.sign({ id: user._id }, secret, {}, (err, token) => {
        if (err) {
          throw err;
        }

        res.header("x-access-token", token).json({
          success: true,
          msg: "User has been found",
          data: {
            id: user._id,
            username: user.username,
            admin: user.admin,
            postazioni: user.postazioni,
            pages: user.pages,
            canLogout: user.canLogout,
          } satisfies TUserResp,
        });
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetUserWithDevice |");
      res.status(500).json({ success: false, msg: error });
    }
  }
}

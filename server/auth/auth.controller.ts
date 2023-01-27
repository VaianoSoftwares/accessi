import UsersDAO from "../dao/users.dao.js";
import Validator from "./validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import errCheck from "../utils/errCheck.js";
import { TUser } from "../types/users.js";

export default class UsersController {
  static async apiRegister(req: Request, res: Response) {
    const parsed = Validator.register(req.body);

    if (parsed.success === false) {
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.message });
    }

    const { username, password, admin, clienti, postazioni, device } =
      parsed.data;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashPsw = await bcrypt.hash(password, salt);

      const userDoc: TUser = {
        username,
        password: hashPsw,
        admin,
        clienti: admin ? null : (clienti as string[]),
        postazioni: admin ? null : (postazioni as string[]),
        device: admin ? false : device,
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
    const parsed = Validator.login(req.body);

    if (parsed.success === false) {
      console.log("apiLogin |", parsed.error);
      return res
        .status(400)
        .json({ success: false, msg: parsed.error.message });
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
            clienti: user.clienti,
            postazioni: user.postazioni,
          },
        });
      });
    } catch (err) {
      const { error } = errCheck(err, "apiLogin |");
      res.status(400).json({ success: false, msg: error, data: null });
    }
  }

  static async apiGetUserWithDevice(req: Request, res: Response) {
    try {
      const user = await UsersDAO.getUserByNameWithDevice(
        req.query.device as string
      );
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found" });
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
            clienti: user.clienti,
            postazioni: user.postazioni,
          },
        });
      });
    } catch (err) {
      const { error } = errCheck(err, "apiGetUserWithDevice |");
      res.status(500).json({ success: false, msg: error });
    }
  }
}
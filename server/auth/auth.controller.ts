import UsersDAO from "../dao/users.dao.js";
import Validator from "./validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import errCheck from "../middlewares/errCheck.js";
import { TUser } from "../types/users.js";

export default class UsersController {
  static async apiRegister(req: Request, res: Response) {
    const { error } = Validator.register(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, msg: error.details[0].message, data: null });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashPsw = await bcrypt.hash(req.body.password as string, salt);

      const userDoc: TUser = {
        username: req.body.username as string,
        password: hashPsw,
        admin: req.body.admin as boolean || false,
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
      console.log(`apiLogin - ${error}`);
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

      const isPswValid = await bcrypt.compare(password, user.password);
      if (!isPswValid) {
        throw new Error("Username/Password non validi.");
      }

      const { GUEST_TOKEN, ADMIN_TOKEN } = process.env;
      if(!GUEST_TOKEN) {
        throw new Error("Guest token is missing.");
      }
      if(!ADMIN_TOKEN) {
        throw new Error("Admin token is missing.");
      }

      const guestToken = jwt.sign({ _id: user._id }, GUEST_TOKEN);
      if(user.admin) {
        const adminToken = jwt.sign({ _id: user._id }, ADMIN_TOKEN);
        res.setHeader("admin-token", adminToken);
      }

      console.log(`${username} logged in.`);

      res.header("guest-token", guestToken).json({
        success: true,
        msg: "Login effettuato",
        data: {
          id: user._id,
          name: user.username,
          admin: user.admin,
        },
      });
    } catch (err) {
      const { error } = errCheck(err, "apiLogin |");
      res.status(400).json({ success: false, msg: error, data: null });
    }
  }
}
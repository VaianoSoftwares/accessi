import UsersDAO from "../dao/users.dao.js";
import Validator from "./validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default class UsersController {
    static async apiRegister(req, res) {
        const { error } = Validator.register(req.body);
        if(error) {
            return res.status(400).json({ success: false, msg: error.details[0].message });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashPsw = await bcrypt.hash(req.body.password, salt);

            const userDoc = {
                username: req.body.username,
                password: hashPsw,
                admin: req.body.admin || false
            };

            const response = await UsersDAO.addUser(userDoc);
            if(response.error) {
                return res.status(400).json({ success: false, msg: response.error.message });
            }
            res.json({ success: true, msg: "Utente registrato con successo", response: response._id });
        } catch(err) {
            console.log(`apiRegister - ${err}`);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiLogin(req, res) {
        const { error } = Validator.login(req.body);
        if(error) {
            return res.status(400).json({ success: false, msg: error.details[0].message });
        }

        const { username, password } = req.body;

        try {
            const user = await UsersDAO.getUserByName(username);
            if(!user) {
                throw new Error("Username/Password non validi.");
            }

            const isPswValid = await bcrypt.compare(password, user.password);
            if(!isPswValid) {
                throw new Error("Username/Password non validi.");
            }

            const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
            
            res
              .header("auth-token", token)
              .json({
                success: true,
                msg: "Login effettuato",
                data: {
                    id: user._id,
                    name: user.username,
                    admin: user.admin
                }
              });
        } catch(err) {
            console.log(`apiLogin - ${err}`);
            res.status(400).json({ success: false, msg: err.message });
        }
    }
};
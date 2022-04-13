import UsersDAO from "../dao/users.dao.js";
import Validator from "./validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default class UsersController {
    static async apiRegister(req, res) {
        const { error } = Validator.register(req.body);
        if(error) {
            return res.status(400).json({ success: false, msg: error.details[0].message, data: null });
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
                return res.status(400).json({ success: false, msg: response.error.message, data: null });
            }
            res.json({ success: true, msg: "Utente registrato con successo", data: response._id });
        } catch(err) {
            console.log(`apiRegister - ${err}`);
            res.status(500).json({ success: false, msg: err.message });
        }
    }

    static async apiLogin(req, res) {
        const { error } = Validator.login(req.body);

        if(error) {
            return res.status(400).json({ success: false, msg: error.details[0].message, data: null });
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

            const guestToken = jwt.sign({ _id: user._id }, process.env.GUEST_TOKEN);
            const adminToken = user.admin ? jwt.sign({ _id: user._id }, process.env.ADMIN_TOKEN) : null;
            if(adminToken) {
                res.setHeader("admin-token", adminToken);
            }

            console.log(`${username} logged in.`);
            
            res
              .header("guest-token", guestToken)
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
            res.status(400).json({ success: false, msg: err.message, data: null });
        }
    }
};
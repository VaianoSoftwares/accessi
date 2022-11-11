import { Collection, MongoClient } from "mongodb";
import errCheck from "../middlewares/errCheck.js";
import { TUser } from "../types/users.js";

let users: Collection<TUser>;

export default class UsersDAO {
    static async injectDB(conn: MongoClient) {
        if(users) return;

        try {
            users = conn.db(process.env.DB_NAME).collection("users");
        } catch(err) {
            errCheck(err, "Failed to inject DB.")
        }
    }

    static async addUser(data: TUser) {
        try {
            const user = await users.findOne({ username: data.username });
            if(user) {
                throw new Error(`Username ${data.username} già utilizzato.`);
            }

            return await users.insertOne(data);
        } catch(err) {
            return errCheck(err, "addUser |");
        }
    }

    static async getUserByName(username: string) {
        try {
            return await users.findOne({ username });
        } catch(err) {
            errCheck(err, "getUserByName |");
        }
    }
}
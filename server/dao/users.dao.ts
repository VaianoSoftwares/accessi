import { Collection, MongoClient, ObjectId } from "mongodb";
import errCheck from "../utils/errCheck.js";
import { TUser } from "../types/users.js";

let users: Collection<TUser>;

export default class UsersDAO {
  static async injectDB(conn: MongoClient) {
    if (users) return;

    try {
      users = conn.db(process.env.DB_NAME).collection("users");
    } catch (err) {
      errCheck(err, "Failed to inject DB.");
    }
  }

  static async addUser(data: TUser) {
    try {
      const user = await users.findOne({ username: data.username });
      if (user) {
        throw new Error(`Username ${data.username} già utilizzato.`);
      }

      return await users.insertOne(data);
    } catch (err) {
      return errCheck(err, "addUser |");
    }
  }

  static async updateUser(_id: string | ObjectId, user: Partial<TUser>) {
    try {
      return await users.updateOne({ _id: new ObjectId(_id) }, user);
    } catch (err) {
      return errCheck(err, "updateUser |");
    }
  }

  static async deleteUser(_id: string | ObjectId) {
    try {
      return await users.deleteOne({ _id: new ObjectId(_id) });
    } catch (err) {
      return errCheck(err, "deleteUser |");
    }
  }

  static async getAllUsers() {
    try {
      return await users
        .find({ admin: false }, { projection: { password: 0 } })
        .toArray();
    } catch (err) {
      errCheck(err, "getAllUsers |");
      return [];
    }
  }

  static async getUserByName(username: string) {
    try {
      return await users.findOne({ username });
    } catch (err) {
      errCheck(err, "getUserByName |");
    }
  }

  static async getUserById(id: string | ObjectId) {
    try {
      return await users.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: "" } }
      );
    } catch (err) {
      errCheck(err, "getUserById |");
    }
  }

  static async getUserByDevice(device: string) {
    try {
      return await users.findOne({ device });
    } catch (err) {
      errCheck(err, "getUserByDevice |");
    }
  }
}

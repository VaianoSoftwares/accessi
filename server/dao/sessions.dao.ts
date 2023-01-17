import { Collection, Document, MongoClient} from "mongodb";
import errCheck from "../middlewares/errCheck.js";

const COLLECTION_NAME = "sessions";

let sessions: Collection<Document>;

export default class SessionsDAO {
  static async injectDB(conn: MongoClient) {
    if (sessions) return;

    try {
      sessions = conn.db(process.env.DB_NAME).collection(COLLECTION_NAME);
    } catch (err) {
      errCheck(err, `Failed to inject DB ${COLLECTION_NAME}.`);
    }
  }

  static async getSessions(filters: Record<string, unknown> = {}, expired = false) {
    const sessionFilter: Record<string, unknown>[] = !expired
    ? [{ expires: { $gt: new Date(new Date().toISOString()) } }]
    : [];

    Object.entries(filters)
      .filter(([, v]) => v)
      .forEach(([k, v]) => {
        let filter: Record<string, unknown> = {};
        const filterName = `session.user.${k}`;
        filter[filterName] = { $regex: new RegExp(v as string, "i") };
        sessionFilter.push(filter);
      });

    const query = { $and: sessionFilter };

    try {
      return await sessions.find(query).toArray();
    } catch (err) {
      errCheck(err, "getSessions |");
      return [];
    }
  }

  static async deleteSessions(filters: Record<string, unknown> = {}, expired: boolean = true) {
    const sessionFilter: Record<string, unknown>[] = expired
      ? [{ expires: { $lt: new Date(new Date().toISOString()) } }]
      : [];

    Object.entries(filters)
      .filter(([, v]) => v)
      .forEach(([k, v]) => {
        let filter: Record<string, unknown> = {};
        const filterName = `session.user.${k}`;
        filter[filterName] = { $regex: new RegExp(v as string, "i") };
        sessionFilter.push(filter);
      });

    const query = { $or: sessionFilter };

    try {
      return await sessions.deleteMany(query);
    } catch (err) {
      return errCheck(err, "deleteSessions |");
    }
  }
}
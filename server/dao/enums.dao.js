let enums;

export default class EnumsDAO {
    static async injectDB(conn) {
        if(enums) return;

        try {
            enums = await conn.db(process.env.DB_NAME).collection("enums");
        } catch(err) {
            console.error(`DB injection failed. ${err}`);
        }
    }

    static async getEnums() {
        try {
            return await enums.findOne();
        } catch(err) {
            console.log(`getEnums - ${err}`);
        }
    }

    static async pushAssegnaz(dataToPush = []) {
        try {
            return await enums.updateOne(
              {},
              { $addToSet: { assegnazione: { $each: dataToPush } } }
            );
        } catch(err) {
            console.log(`updateEnum - ${err}`);
            return { error: err };
        }
    }

    static async pullAssegnaz(dataToPull = []) {
        try {
            return await enums.updateOne(
              {},
              { $pullAll: { assegnazione: dataToPull } }
            );
        } catch(err) {
            console.log(`updateEnum -${err}`);
            return { error: err };
        }
    }
};
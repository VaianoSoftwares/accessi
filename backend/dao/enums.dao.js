let enums;

export default class EnumsDAO {
    static async injectDB(conn) {
        if(enums) {
            return;
        }

        try {
            enums = await conn.db(process.env.DB_NAME).collection("enums");
        } catch(err) {
            console.error(`DB injection failed. ${err}`);
        }
    }

    static async getEnums(tipoEnum) {
        try {
            let projection = { _id: 0 };
            if(tipoEnum) {
                projection[tipoEnum] = 1;
            }
            return await enums.findOne({}, { projection });
        } catch(err) {
            console.log(`getEnums - ${err}`);
        }
    }

    static async pushEnum(fieldToUpd, dataToPush = []) {
        try {
            let expr = {};
            expr[fieldToUpd] = { $each: dataToPush }; 
            return await enums.updateOne({}, { $addToSet: expr });
        } catch(err) {
            console.log(`updateEnum - ${err}`);
            return { error: err };
        }
    }

    static async pullEnum(fieldToUpd, dataToPull = []) {
        try {
            let expr = {};
            expr[fieldToUpd] = dataToPull;
            return await enums.updateOne({}, { $pullAll: expr });
        } catch(err) {
            console.log(`updateEnum -${err}`);
            return { error: err };
        }
    }
};
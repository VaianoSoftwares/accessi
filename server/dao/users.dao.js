let users;

export default class UsersDAO {
    static async injectDB(conn) {
        if(users) return;

        try {
            users = await conn.db(process.env.DB_NAME).collection("users");
        } catch(err) {
            console.log(`Failed to inject DB. ${err}`);
        }
    }

    static async addUser(data) {
        try {
            const user = await users.findOne({ username: data.username });
            if(user) {
                throw new Error(`Username ${data.username} già utilizzato.`);
            }

            return await users.insertOne(data);
        } catch(err) {
            console.log(`addUser - ${err}`);
            return { error: err };
        }
    }

    static async getUserByName(username) {
        try {
            return await users.findOne({ username: username });
        } catch(err) {
            console.log(`login - ${err}`);
        }
    }
};
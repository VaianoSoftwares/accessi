let permessi;

export default class PermessiDAO {
    static async injectDB(conn) {
        if(permessi) return;

        try {
          permessi = await conn.db(process.env.DB_NAME).collection("permessi");
        } catch (err) {
          console.log(`Failed to inject DB. ${err}`);
        }
    }

    static async getPermessi(filters = {}) {
        let query = {};
        Object.entries(filters)
          .filter(([key, value]) => value)
          .forEach(([key, value]) => {
            switch (key) {
              case "username":
                query[key] = value;
                break;
              case "date":
                const monthAndYear = value.substring(value.indexOf("-"));
                query[key] = { $regex: new RegExp(monthAndYear) };
                break;
              default:
            }
          });
          console.log(query);
        try {
            const cursor = permessi.find(query, {
              projection: {
                _id: 0,
                username: 1,
                date: 1,
              },
            });
            const displayCursor = cursor.limit(500).skip(0);
            const permessiList = await displayCursor.toArray();
            return permessiList;
        } catch(err) {
            console.log("getPermessi | ", err);
            return [];
        }
    }

    static async addPermesso(data) {
        try {
            const permesso = await permessi.findOne(data);
            if(permesso) throw Error("Permesso già esistente");

            return await permessi.insertOne(data);
        } catch(err) {
            console.log("addPermessi | ", err);
            return { error: err };
        }
    }

    static async deletePermesso(data) {
        try {
            return await permessi.deleteOne(data);
        } catch(err) {
            console.log("deletePermessi | ", err);
            return { error: err };
        }
    }
};
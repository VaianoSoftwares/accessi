import http from "../http-common.js";

class UserDataService {
    token;

    register(data) {
        return http.post("/users/register", data, {
            headers: {
                "auth-token": this.token
            }
        });
    }

    login(username, password) {
        return http.post("/users/login", { username, password });
    }

    getTipiUtenti() {
        return http.get("/users/tipi-utenti", {
            headers: {
                "auth-token": this.token
            }
        });
    }
}

export default new UserDataService();
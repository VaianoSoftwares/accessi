import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";

import authRoutes from "./auth/auth.routes.js";
import badgesRoutes from "./api/badges.routes.js";
import verifyToken from "./auth/verifyToken.js";

const app = express();

const __dirname = path.resolve();

// dotenv config
dotenv.config();

// print out request endpoint url & method
app.use((req, res, next) => {
    console.log(`Request endpoint: ${req.method} ${req.url}`);
    next();
});

// middlewares configs
app.use(express.json());
app.use(cors({
    exposedHeaders: "auth-token"
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.resolve(__dirname, "server/tmp")
}));

// public route
app.use("/api/v1/public", express.static(path.resolve(__dirname, "server/public")));

// routes
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/badges", verifyToken, badgesRoutes);

console.log(`App environment: ${process.env.NODE_ENV}`);
// backend make public and get compiled react app
if(process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
    app.use(express.static(path.resolve(__dirname, "client/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
    });
}

// failed request
app.get("*", (req, res) => res.status(404).send("page not found"));

export default app;
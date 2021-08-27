import express from "express";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";

import authRoutes from "./auth/auth.routes.js";
import badgesRoutes from "./api/badges.routes.js";
import verifyToken from "./auth/verifyToken.js";

const app = express();

const __dirname = path.resolve();

app.use(express.json());
app.use(cors({
    exposedHeaders: "auth-token"
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.resolve(__dirname, "tmp")
}));
app.use("/api/public", express.static(path.resolve(__dirname, "public")));

app.use("/api/users", authRoutes);
app.use("/api/badges", verifyToken, badgesRoutes);
app.use("*", (req, res) => res.status(404).send("page not found"));

export default app;
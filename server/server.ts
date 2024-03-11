import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import mountRoutes from "./routes/index.js";
import reqLogger from "./middlewares/reqLogger.js";
import IgnoredReqs from "./middlewares/IgnoredReqs.js";

const app = express();

console.log("App environment:", process.env.NODE_ENV);
if (process.env.NODE_ENV == "development") {
  dotenv.config();
}

// print out request endpoint url & method
app.use(reqLogger);

// use cors middleware
app.use(
  cors({
    exposedHeaders: "x-access-token",
  })
);

// serve ignored reqs
app.use(IgnoredReqs.optionsMethod);
app.use(IgnoredReqs.home);

// use bodyparser middlewares
app.use(express.json());

// use file uploader middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.resolve("server", "tmp"),
  })
);

// routes
mountRoutes(app);

export default app;

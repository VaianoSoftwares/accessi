import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import mountRoutes from "./routes/index.js";
import reqLogger from "./middlewares/reqLogger.js";
import IgnoredReqs from "./middlewares/IgnoredReqs.js";
import invalidPathHandler from "./middlewares/invalidPathHandler.js";
import redirectHttpReqs from "./middlewares/redirectHttpReqs.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

console.log("App environment:", process.env.NODE_ENV);
if (process.env.NODE_ENV == "development") {
  dotenv.config();
}

// use cookie parser
app.use(cookieParser());

// print out request endpoint url & method
app.use(reqLogger);

// use cors middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// redirect http requests to https
app.use(redirectHttpReqs);

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

// public route
app.use("/api/v1/public", express.static(path.resolve("server", "public")));

// certificate challenges
if (process.env.NODE_ENV != "development") {
  app.use(
    "/.well-known/acme-challenge",
    express.static("/var/www/letsencrypt/.well-known/acme-challenge")
  );
}

// routes
mountRoutes(app);

// manage failed request
app.use(errorHandler);

// html page request (production mode only)
if (process.env.NODE_ENV != "development") {
  app.use(express.static(path.resolve("client", "dist")));
  app.get("*", (_, res) => {
    res.sendFile(path.resolve("client", "dist", "index.html"));
  });
}

// invalid path request
app.use(invalidPathHandler);

export default app;

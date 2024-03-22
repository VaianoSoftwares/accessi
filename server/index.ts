import app from "./server.js";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

const httpPort = process.env.HTTP_PORT || 4317;
const httpsPort = process.env.HTTPS_PORT || 4316;

const privateKey = fs.readFileSync(path.join("server", "certs", "server.key"));
const certificate = fs.readFileSync(path.join("server", "certs", "server.crt"));

const httpsOptions = {
  key: privateKey,
  cert: certificate,
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

httpServer.listen(httpPort, () =>
  console.log(`HTTP Server running on port ${httpPort}.`)
);
httpsServer.listen(httpsPort, () =>
  console.log(`HTTPS Server running on port ${httpsPort}.`)
);

httpsServer.keepAliveTimeout = 1000 * 60 * 60 * 24; // 1 day in MS
httpsServer.headersTimeout = httpsServer.keepAliveTimeout + 1000;

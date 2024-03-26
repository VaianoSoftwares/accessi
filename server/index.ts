import app from "./server.js";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

const httpPort = process.env.HTTP_PORT || 4316;
const httpsPort = process.env.HTTPS_PORT || 4317;

const privateKey = fs.readFileSync(path.join("server", "certs", "privkey.pem"));
const certificate = fs.readFileSync(path.join("server", "certs", "cert.pem"));
const chain =
  process.env.NODE_ENV != "development"
    ? fs.readFileSync(path.join("server", "certs", "fullchain.pem")) ||
      undefined
    : undefined;

const httpsOptions = {
  key: privateKey,
  cert: certificate,
  ca: chain,
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

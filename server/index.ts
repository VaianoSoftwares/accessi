import app from "./server.js";
import https from "https";
import fs from "fs";
import path from "path";

const privateKey = fs.readFileSync(path.join("server", "certs", "server.key"));
const certificate = fs.readFileSync(path.join("server", "certs", "server.crt"));

const credentials = {
  key: privateKey,
  cert: certificate,
};

const port = process.env.PORT || 4316;
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () =>
  console.log(`HTTPS Server running on port ${port}.`)
);

httpsServer.keepAliveTimeout = 1000 * 60 * 60 * 24; // 1 day in MS
httpsServer.headersTimeout = httpsServer.keepAliveTimeout + 1000;

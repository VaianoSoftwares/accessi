import { setupGlobalLogger } from "./utils/logger.js";
setupGlobalLogger();

import app from "./server.js";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

const httpPort = process.env.HTTP_PORT || 4316;
const httpsPort = process.env.HTTPS_PORT || 4317;

const privKeyPath = process.env.PRIVKEY_PATH
  ? path.resolve(process.env.PRIVKEY_PATH)
  : path.join("server", "certs", "privkey.pem");
const certPath = process.env.CERT_PATH
  ? path.resolve(process.env.CERT_PATH)
  : path.join("server", "certs", "cert.pem");
const chainPath = process.env.CHAIN_PATH
  ? path.resolve(process.env.CHAIN_PATH)
  : path.join("server", "certs", "fullchain.pem");

function loadCerts(
  privKeyPath: string,
  certPath: string,
  chainPath?: string | undefined
) {
  const privateKey = fs.readFileSync(privKeyPath);
  const certificate = fs.readFileSync(certPath);
  const chain =
    process.env.NODE_ENV != "development" && chainPath
      ? fs.readFileSync(chainPath) || undefined
      : undefined;

  return {
    key: privateKey,
    cert: certificate,
    ca: chain,
  };
}

const httpsOptions = loadCerts(privKeyPath, certPath, chainPath);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

httpServer.listen(httpPort, () =>
  console.log(`HTTP Server running on port ${httpPort}.`)
);
httpsServer.listen(httpsPort, () =>
  console.log(`HTTPS Server running on port ${httpsPort}.`)
);

httpServer.keepAliveTimeout = 1000 * 60 * 60 * 24; // 1 day in MS
httpServer.headersTimeout = httpsServer.keepAliveTimeout + 1000;
httpsServer.keepAliveTimeout = 1000 * 60 * 60 * 24; // 1 day in MS
httpsServer.headersTimeout = httpsServer.keepAliveTimeout + 1000;

process.on("SIGHUP", () => {
  console.log("Renewing HTTPS certificates...");
  try {
    const newOptions = loadCerts(privKeyPath, certPath, chainPath);
    httpsServer.setSecureContext(newOptions);
    console.log("Certificates renewed successfully");
  } catch (err) {
    console.error("Error renewing certificates:", err);
  }
});

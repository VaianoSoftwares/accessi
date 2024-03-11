import path from "path";

export const __dirname = path.resolve();
export const UPLOADS_DIR = path.resolve(
  __dirname,
  "server",
  "public",
  "uploads"
);

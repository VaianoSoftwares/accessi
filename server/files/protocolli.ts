import path from "path";
import fs from "fs/promises";
import { UploadedFile } from "express-fileupload";
import { BaseError } from "../_types/errors.js";

const __dirname = path.resolve();
const PUBLIC_DIR = path.resolve(__dirname, "server", "public");

const PROT_DIR = path.resolve(PUBLIC_DIR, "prot");

function protDocPrefix(protId: number) {
  return `PROT${String(protId).padStart(10, "0")}-`;
}

export async function uploadDocs(protId: number, docs: UploadedFile[]) {
  const maxDocSize = 50 * 1024 * 1024;

  const uploadedDocs = await Promise.all(
    docs.map(async (doc) => {
      const docSize = doc.size;
      if (doc.size > maxDocSize) {
        throw new BaseError("File troppo grande", {
          context: { docSize, maxDocSize, protId },
        });
      }

      const fileName = `${protDocPrefix(protId)}-${doc.name}`;
      const filePath = path.resolve(PROT_DIR, fileName);
      await doc.mv(filePath);

      return doc.name;
    })
  );

  return uploadedDocs;
}

export async function deleteDocs(protId: number) {
  const docs = await fs.readdir(PROT_DIR);
  const filenamePrefix = protDocPrefix(protId);

  const removedDocs = await Promise.all(
    docs
      .filter((fileName) => fileName.startsWith(filenamePrefix))
      .map(async (fileName) => {
        const filePath = path.resolve(PROT_DIR, fileName);
        await fs.unlink(filePath);
        return { fileName, filePath };
      })
  );

  return removedDocs;
}

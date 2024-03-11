import path from "path";
import fs from "fs/promises";
import { UploadedFile } from "express-fileupload";
import { BaseError } from "../types/errors.js";
import { UPLOADS_DIR } from "./index.js";

function protDocPrefix(protId: number) {
  return `PROT${String(protId)}_`;
}

export async function uploadDocs(protId: number, docs: UploadedFile[]) {
  const maxDocSize = 50 * 1024 * 1024;

  return await Promise.all(
    docs.map(async (doc) => {
      const docSize = doc.size;
      if (doc.size > maxDocSize) {
        throw new BaseError("File troppo grande", {
          context: { docSize, maxDocSize, protId, filename: doc.name },
        });
      }

      const fileName = `${protDocPrefix(protId)}${doc.name}`;
      const filePath = path.resolve(UPLOADS_DIR, fileName);
      await doc.mv(filePath);

      return doc.name;
    })
  );
}

export async function deleteDocs(protId: number) {
  const docs = await fs.readdir(UPLOADS_DIR);
  const filenamePrefix = protDocPrefix(protId);

  return await Promise.all(
    docs
      .filter((fileName) => fileName.startsWith(filenamePrefix))
      .map(async (fileName) => {
        const filePath = path.resolve(UPLOADS_DIR, fileName);
        await fs.unlink(filePath);
        return { fileName, filePath };
      })
  );
}

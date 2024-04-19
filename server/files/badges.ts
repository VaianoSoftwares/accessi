import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { UploadedFile } from "express-fileupload";
import { BaseError } from "../types/errors.js";
import { UPLOADS_DIR } from "./index.js";

async function uploadFile(
  prefix: string,
  key: number,
  file: UploadedFile,
  options: { expectedExt: string; maxSize: number }
) {
  const fileExt = path.extname(file.name);
  if (fileExt !== options.expectedExt) {
    throw new BaseError("Estensione file non valida", {
      context: { fileExt, expectedFileExt: options.expectedExt },
    });
  }

  const fileSize = file.data.length;
  if (fileSize > options.maxSize) {
    throw new BaseError("File troppo grande", {
      context: { fileSize, maxFileSize: options.maxSize },
    });
  }

  const newName = `${prefix}${key}${fileExt}`;
  const filePath = path.resolve(UPLOADS_DIR, newName);
  console.log("File has been uploaded at location", filePath);

  await file.mv(filePath);
  return { fileName: newName, filePath };
}

async function deleteFile(prefix: string, key: number) {
  const fileName = `${prefix}${key}.jpg`;
  const filePath = path.resolve(UPLOADS_DIR, fileName);

  if (!existsSync(filePath)) return;

  await fs.rm(filePath);
  console.log("File has been removed at location", filePath);
  return { fileName, filePath };
}

export async function uploadPfp(id: number, pfp: UploadedFile) {
  return await uploadFile("PFP_", id, pfp, {
    expectedExt: ".jpg",
    maxSize: 50 * 1024,
  });
}
export async function deletePfp(id: number) {
  return await deleteFile("PFP_", id);
}

export async function uploadPrivacy(id: number, privacy: UploadedFile) {
  return await uploadFile("PRIVACY_", id, privacy, {
    expectedExt: ".pdf",
    maxSize: 50 * 1024 * 1024,
  });
}
export async function deletePrivacy(id: number) {
  return await deleteFile("PRIVACY_", id);
}

export async function uploadDocumento(id: number, file: UploadedFile) {
  return await uploadFile("DOC_", id, file, {
    expectedExt: ".jpg",
    maxSize: 50 * 1024 * 1024,
  });
}
export async function deleteDocumento(id: number) {
  return await deleteFile("DOC_", id);
}

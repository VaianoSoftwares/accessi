import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { UploadedFile } from "express-fileupload";
import { BaseError } from "../types/errors.js";
import { UPLOADS_DIR } from "./index.js";

async function uploadFile(
  prefix: string,
  key: string,
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

async function deleteFile(prefix: string, key: string) {
  const fileName = `${prefix}${key}.jpg`;
  const filePath = path.resolve(UPLOADS_DIR, fileName);

  if (!existsSync(filePath)) return;

  await fs.rm(filePath);
  console.log("File has been removed at location", filePath);
  return { fileName, filePath };
}

export async function uploadPfp(barcode: string, pfp: UploadedFile) {
  return await uploadFile("PFP_", barcode, pfp, {
    expectedExt: ".jpg",
    maxSize: 50 * 1024,
  });
}
export async function deletePfp(barcode: string) {
  return await deleteFile("PFP_", barcode);
}

export async function uploadPrivacy(barcode: string, privacy: UploadedFile) {
  return await uploadFile("PRIVACY_", barcode, privacy, {
    expectedExt: ".pdf",
    maxSize: 50 * 1024 * 1024,
  });
}
export async function deletePrivacy(barcode: string) {
  return await deleteFile("PRIVACY_", barcode);
}

export async function uploadDocumento(barcode: string, file: UploadedFile) {
  return await uploadFile("DOC_", barcode, file, {
    expectedExt: ".jpg",
    maxSize: 50 * 1024 * 1024,
  });
}
export async function deleteDocumento(barcode: string) {
  return await deleteFile("DOC_", barcode);
}

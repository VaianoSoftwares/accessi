import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { UploadedFile } from "express-fileupload";
import { BaseError } from "../types/errors.js";
import { TDoc } from "../types/badges.js";

const __dirname = path.resolve();
const PUBLIC_DIR = path.resolve(__dirname, "server", "public");

export async function uploadPfp(barcode: string, pfp: UploadedFile) {
  const fileExt = path.extname(pfp.name);
  const expectedFileExt = ".jpg";
  if (fileExt !== expectedFileExt) {
    throw new BaseError("Estensione file non valida", {
      context: { fileExt },
    });
  }

  const fileSize = pfp.data.length;
  const maxFileSize = 50 * 1024;
  if (fileSize > maxFileSize) {
    throw new BaseError("File troppo grande", {
      context: { fileSize, maxFileSize },
    });
  }

  const newName = `PFP_${barcode}${fileExt}`;
  const filePath = path.resolve(PUBLIC_DIR, "foto-profilo", newName);
  console.log("File has been uploaded at location", filePath);

  await pfp.mv(filePath);
  return { fileName: newName, filePath };
}

export async function deletePfp(barcode: string) {
  const fileName = `PFP_${barcode}.jpg`;
  const filePath = path.resolve(PUBLIC_DIR, "foto-profilo", fileName);

  if (!existsSync(filePath)) return;

  await fs.rm(filePath);
  console.log("File has been removed at location", filePath);
  return { fileName, filePath };
}

export async function uploadPrivacy(barcode: string, privacy: UploadedFile) {
  const fileExt = path.extname(privacy.name);
  const expectedFileExt = ".pdf";
  if (fileExt !== expectedFileExt) {
    throw new BaseError("Estensione file non valida", {
      context: { fileExt },
    });
  }

  const fileSize = privacy.data.length;
  const maxFileSize = 50 * 1024 * 1024;
  if (fileSize > maxFileSize) {
    throw new BaseError("File troppo grande", {
      context: { fileSize, maxFileSize },
    });
  }

  const newName = `PRIVACY_${barcode}${fileExt}`;
  const filePath = path.resolve(PUBLIC_DIR, "privacy", newName);
  console.log("File has been uploaded at location", filePath);

  await privacy.mv(filePath);
  return { fileName: newName, filePath };
}

export async function deletePrivacy(barcode: string) {
  const fileName = `PRIVACY_${barcode}.pdf`;
  const filePath = path.resolve(PUBLIC_DIR, "privacy", fileName);

  if (!existsSync(filePath)) return;

  await fs.rm(filePath);
  console.log("File has been removed at location", filePath);
  return { fileName, filePath };
}

export async function uploadDocumento(ndoc: string, file: UploadedFile) {
  const fileExt = path.extname(file.name);
  const expectedFileExt = ".jpg";
  if (fileExt !== expectedFileExt) {
    throw new BaseError("Estensione file non valida", {
      context: { fileExt },
    });
  }

  const fileSize = file.data.length;
  const maxFileSize = 50 * 1024 * 1024;
  if (fileSize > maxFileSize) {
    throw new BaseError("File troppo grande", {
      context: { fileSize, maxFileSize },
    });
  }

  const newName = `DOC_${ndoc}${fileExt}`;
  const filePath = path.resolve(PUBLIC_DIR, "documenti", newName);
  console.log("File has been uploaded at location", filePath);

  await file.mv(filePath);
  return { fileName: newName, filePath };
}

export async function deleteDocumento(ndoc: string, tdoc: string) {
  const fileName = `DOC_${ndoc}.jpg`;
  const filePath = path.resolve(PUBLIC_DIR, "documenti", fileName);

  if (!existsSync(filePath)) return;

  await fs.rm(filePath);
  console.log("File has been removed at location", filePath);
  return { fileName, filePath };
}

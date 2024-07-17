import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { UploadedFile } from "express-fileupload";
import { BaseError } from "../types/errors.js";
import { UPLOADS_DIR } from "./index.js";

type TKey = string | number;

export default class BadgesFileManager {
  private static async uploadFile(
    prefix: string,
    key: TKey,
    file: UploadedFile,
    options?: { expectedExt?: string; maxSize?: number }
  ) {
    const fileExt = path.extname(file.name);
    if (options?.expectedExt && fileExt !== options.expectedExt) {
      throw new BaseError("Estensione file non valida", {
        context: { fileExt, expectedFileExt: options.expectedExt },
      });
    }

    const fileSize = file.data.length;
    if (options?.maxSize && fileSize > options.maxSize) {
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

  private static async deleteFile(prefix: string, key: TKey, ext: string) {
    const fileName = `${prefix}${key}${ext}`;
    const filePath = path.resolve(UPLOADS_DIR, fileName);

    if (!existsSync(filePath)) return;

    await fs.rm(filePath);
    console.log("File has been removed at location", filePath);
    return { fileName, filePath };
  }

  public static async uploadPfp(key: TKey, pfp: UploadedFile) {
    return await BadgesFileManager.uploadFile("PFP_", key, pfp, {
      expectedExt: ".jpg",
      maxSize: 50 * 1024,
    });
  }
  public static async deletePfp(key: TKey) {
    return await BadgesFileManager.deleteFile("PFP_", key, ".jpg");
  }

  public static async uploadPrivacy(key: TKey, privacy: UploadedFile) {
    return await BadgesFileManager.uploadFile("PRIVACY_", key, privacy, {
      expectedExt: ".pdf",
      maxSize: 50 * 1024 * 1024,
    });
  }
  public static async deletePrivacy(key: TKey) {
    return await BadgesFileManager.deleteFile("PRIVACY_", key, ".pdf");
  }

  public static async uploadDocumento(key: TKey, file: UploadedFile) {
    return await BadgesFileManager.uploadFile("DOC_", key, file, {
      expectedExt: ".pdf",
      maxSize: 50 * 1024 * 1024,
    });
  }
  public static async deleteDocumento(key: TKey) {
    return await BadgesFileManager.deleteFile("DOC_", key, ".pdf");
  }

  public static async uploadDocumentoProv(key: TKey, file: UploadedFile) {
    return await BadgesFileManager.uploadFile("DOCP_", key, file, {
      expectedExt: ".pdf",
      maxSize: 50 * 1024 * 1024,
    });
  }
  public static async deleteDocumentoProv(key: TKey) {
    return await BadgesFileManager.deleteFile("DOCP_", key, ".pdf");
  }
}

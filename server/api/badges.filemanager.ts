import path from "path";
import fs from "fs/promises";
import { FileArray, UploadedFile } from "express-fileupload";
import errCheck from "../utils/errCheck.js";
import { NullOrUndefOr } from "../types/nullable.js";
import { PathLike } from "fs";

const __dirname = path.resolve();
const PUBLIC_DIR = path.resolve(__dirname, "server", "public");

// const validPfpExt = [".png", ".jpeg", ".jpg"];
const validDocExt: ReadonlyArray<string> = [".png", ".jpeg", ".jpg"];

export default class FileManager {

    static async uploadPfp(files: NullOrUndefOr<FileArray>, barcode: string, tipoBadge: string) {
        if(!files || Object.keys(files).length === 0) {
            console.log("No file to upload.");
            return {};
        }
        else if(tipoBadge !== "BADGE") {
            console.log(`Can't upload pfp for badge type: ${tipoBadge}`);
            return {};
        }
    
        try {
            const pfp = files.pfp as UploadedFile;
            console.log("file name: ", pfp.name);
    
            const fileExt = path.extname(pfp.name);
            const expectedFileExt = ".jpg";
            if(fileExt !== expectedFileExt) {
                throw new Error(`${fileExt} estensione file non valida.`);
            }

            const fileSize = pfp.data.length;
            const maxFileSize = 50 * 1024;
            if(fileSize > maxFileSize) {
                throw new Error(
                    `Dimensione file ${fileSize/1024}KB superiore a ${maxFileSize/1024}KB.`
                );
            }
    
            const newName = `USER_${barcode}${fileExt}`;
            const filePath = path.resolve(PUBLIC_DIR, "foto-profilo", newName);
            console.log("file path: ", filePath);
    
            await pfp.mv(filePath);
            return { fileName: newName };
        } catch(err) {
            return errCheck(err, "uploadPfp |");
        }
    }

    static async deletePfp(barcode: string) {
        try {
            const dirPath =  path.resolve(PUBLIC_DIR, "foto-profilo");
            const pfps = await fs.readdir(dirPath);

            const [ pfpToDel ] = pfps.filter(pfp => pfp.includes(barcode));

            if(pfpToDel) {
                await fs.unlink(path.resolve(dirPath, pfpToDel));
                console.log(`deletePfp | Badge ${barcode}, foto profilo eliminata`);
            }
            else {
                console.log(`deletePfp | Badge ${barcode} e' sprovvisto di foto profilo`);
            }
        } catch(err) {
            return errCheck(err, "deletePfp |");
        }
    }

    static async uploadDocumento(files: NullOrUndefOr<FileArray>, codice: string) {
        try {
            if(!files || Object.keys(files).length === 0)
                throw new Error("Nessun file selezionato.");
            
            const docimg = files.docimg as UploadedFile;

            const fileExt = path.extname(docimg.name);
            if(!validDocExt.includes(fileExt)) {
                throw new Error(
                    `Estensione file ${fileExt} non valida.`
                );
            }
            
            const fileSize = docimg.data.length;
            const maxFileSize = 10 * 1024 * 1024;
            if(fileSize > maxFileSize) {
                throw new Error(
                    `Dimensione file ${fileSize/1024}KB maggiore di ${maxFileSize/1024}KB.`
                );
            }

            const newName = `DOC_${codice}${fileExt}`;
            const filePath = path.resolve(PUBLIC_DIR, "documenti", newName);
            console.log("file path: ", filePath);
    
            await docimg.mv(filePath);
            return { filename: newName }; 
        } catch(err) {
            return errCheck(err, "uploadDocumento |");
        }
    }

    static async deleteDocumento(codice: string) {
        try {
            const dirPath =  path.resolve(PUBLIC_DIR, "documenti");
            const docs = await fs.readdir(dirPath);

            const [ docToDel ] = docs.filter(doc => doc.includes(codice));

            if(!docToDel)
                throw new Error(`Documento ${codice} non esistente.`);
            
            await fs.unlink(path.resolve(dirPath, docToDel));
            console.log(`deleteDocumento | Documento ${codice} eliminato`);
        } catch(err) {
            return errCheck(err, "deleteDocumento |");
        }
    }

    static async #isDir(path: PathLike) {
        try {
            const stat = await fs.lstat(path);
            return stat.isDirectory();
        } catch(err) {
            return false;
        }
    }

    static async getFilenamesByDate(date: string) {
        const dirPath = path.resolve(PUBLIC_DIR, "calendario", date);
        
        try {
            if(!this.#isDir(dirPath))
                throw new Error(`${dirPath} not a directory`);
            
            return await fs.readdir(dirPath);
        } catch(err) {
            errCheck(err, "getFilenamesByDate |");
            return [] as string[];
        }
    }

    static async uploadCalendarioFiles(files: NullOrUndefOr<FileArray>, date: string) {
        try {
            if(!files || Object.keys(files).length === 0)
                throw new Error("Nessun file selezionato.");

            const filesToUpl = Array.isArray(files.files)
              ? files.files
              : [files.files];

            const dirPath = path.resolve(PUBLIC_DIR, "calendario", date);
            if(!(await this.#isDir(dirPath))) {
                console.log("Created directory", date);
                await fs.mkdir(dirPath);
            }

            const filenames = await Promise.all(
              Object.values(filesToUpl).map(async (file) => {
                const filePath = path.resolve(dirPath, file.name);
                await file.mv(filePath);
                return file.name;
              })
            );

            return { filenames };
        } catch(err) {
            return errCheck(err, "uploadCalendarioFiles |");
        }
    }

    static async deleteCalendarioFile(filename: string, date: string) {
        try {
            const dirPath = path.resolve(PUBLIC_DIR, "calendario", date);
            const dir = await fs.readdir(dirPath);

            const [fileToDel] = dir.filter(f => f === filename);

            if(!fileToDel)
                throw Error(`File ${filename} non esistente.`);
            
            await fs.unlink(path.resolve(dirPath, fileToDel));
            console.log(`deleteCalendarioFile | File ${fileToDel} eliminato con successo.`);

            if(dir.length === 1) {
              await fs.rmdir(dirPath);
              console.log(
                `deleteCalendarioFile | Directory ${dirPath} eliminata con successo.`
              );
            }

            return { filename: fileToDel };
        } catch(err) {
            return errCheck(err, "deleteCalendarioFile |");
        }
    }

    static async deleteTmpFiles() {
        try {
            const dirPath = path.resolve(__dirname, "server", "tmp");
            const files = await fs.readdir(dirPath);
            files.forEach(async file => await fs.unlink(path.resolve(dirPath, file)));
            return {};
        } catch(err) {
            return errCheck(err, "deleteTmpFiles |");
        }
    }

}
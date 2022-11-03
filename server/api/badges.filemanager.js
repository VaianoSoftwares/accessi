import path from "path";
import fs from "fs/promises";

const __dirname = path.resolve();

// const validPfpExt = [".png", ".jpeg", ".jpg"];
const validDocExt = [".png", ".jpeg", ".jpg"];

export default class FileManager {

    static async uploadPfp(files, barcode, tipoBadge) {
        if(!files || Object.keys(files).length === 0) {
            console.log("No file to upload.");
            return {};
        }
        else if(tipoBadge !== "BADGE") {
            console.log(`Can't upload pfp for badge type: ${tipoBadge}`);
            return {};
        }
    
        try {
            const { pfp } = files;
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
            const filePath = path.resolve(__dirname, "server", "public", "foto-profilo", newName);
            console.log("file path: ", filePath);
    
            await pfp.mv(filePath);
            return { fileName: newName };
        } catch(err) {
            console.log("fileUpload | ", err);
            return { error: err };
        }
    }

    static async deletePfp(barcode) {
        try {
            const dirPath =  path.resolve(__dirname, "server", "public", "foto-profilo");
            const pfps = await fs.readdir(dirPath);

            const [ pfpToDel ] = pfps.filter(pfp => pfp.includes(barcode));

            if(pfpToDel) {
                await fs.unlink(path.resolve(dirPath, pfpToDel));
                console.log(`deletePfp | Badge ${barcode}, foto profilo eliminata`);
            }
            else {
                console.log(`deletePfp | Badge ${barcode} e' sprovvisto di foto profilo`);
            }

            return {};
        } catch(err) {
            console.log("deletePfp | ", err);
            return { error: err };
        }
    }

    static async uploadDocumento(files, codice) {
        try {
            if(!files || Object.keys(files).length === 0)
                throw new Error("Nessun file selezionato.");
            
            const { docimg } = files;

            const fileExt = path.extname(docimg.name);
            if(!validDocExt.includes(fileExt)) {
                throw new Error(
                    `Estensione file ${fileExt} non valida.`
                );
            }
            
            const fileSize = docimg.data.size;
            const maxFileSize = 10 * 1024 * 1024;
            if(fileSize > maxFileSize) {
                throw new Error(
                    `Dimensione file ${fileSize/1024}KB maggiore di ${maxFileSize/1024}KB.`
                );
            }

            const newName = `DOC_${codice}${fileExt}`;
            const filePath = path.resolve(__dirname, "server", "public", "documenti", newName);
            console.log("file path: ", filePath);
    
            await docimg.mv(filePath);
            return { filename: newName }; 

        } catch(err) {
            console.log("uploadDocument | ", err);
            return { error: err };
        }
    }

    static async deleteDocumento(codice) {
        try {
            const dirPath =  path.resolve(__dirname, "server", "public", "documenti");
            const docs = await fs.readdir(dirPath);

            const [ docToDel ] = docs.filter(doc => doc.includes(codice));

            if(docToDel) {
                await fs.unlink(path.resolve(dirPath, docToDel));
                console.log(`deleteDocumento | Documento ${codice} eliminato`);
            }
            else
                throw new Error(`Documento ${codice} non esistente.`);

            return {};
        } catch(err) {
            console.log("deleteDocumento | ", err);
            return { error: err };
        }
    }

    static async deleteTmpFiles() {
        try {
            const dirPath = path.resolve(__dirname, "server", "tmp");
            const files = await fs.readdir(dirPath);
            files.forEach(async file => await fs.unlink(path.resolve(dirPath, file)));
            return {};
        } catch(err) {
            console.log("deleteTmpFiles | ", err);
            return { error: err };
        }
    }

};
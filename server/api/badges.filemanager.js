import path from "path";
import fs from "fs/promises";

const __dirname = path.resolve();

//const validPfpExt = [".png", ".jpeg", ".jpg"];

export default class FileManager {
    static async uploadPfp(files, barcode, tipoBadge) {
        if(!files || Object.keys(files).length === 0) {
            console.log("No file to upload.");
            return {};
        }
        else if(tipoBadge !== "badge") {
            console.log(`Can't upload pfp for badge type: ${tipoBadge}`);
            return {};
        }
    
        try {
            const { pfp } = files;
            console.log("file name: ", pfp.name);
    
            const fileExt = path.extname(pfp.name);
            if(fileExt !== ".jpg") {
                throw new Error(`${fileExt} estensione file non valida.`);
            }
    
            const newName = `USER_${barcode}${fileExt}`;
            const filePath = path.resolve(__dirname, "server", "public", "foto-profilo", newName);
            console.log("file path: ", filePath);
    
            await pfp.mv(filePath);
            return { fileName: newName };
        } catch(err) {
            console.log(`fileUpload - ${err}`);
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
                console.log(`deletePfp - Badge ${barcode}, foto profilo eliminata`);
            }
            else {
                console.log(`deletePfp - Badge ${barcode} e' sprovvisto di foto profilo`);
            }

            return {};
        } catch(err) {
            console.log("deletePfp - ", err);
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
            console.log(`deleteTmpFiles - ${err}`);
            return { error: err };
        }
    }
};
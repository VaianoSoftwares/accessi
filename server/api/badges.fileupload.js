import path from "path";
import fs from "fs/promises";

const __dirname = path.resolve("../backend");

//const validPfpExt = [".png", ".jpeg", ".jpg"];

const fileUplBadges = async (files, barcode, tipoBadge) => {
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
        const filePath = path.resolve(__dirname, "public", "foto-profilo", newName);
        console.log("file path: ", filePath);

        await pfp.mv(filePath);
        return { fileName: newName };
    } catch(err) {
        console.log(`fileUpload - ${err}`);
        return { error: err };
    }
};

const deleteTmpFiles = async () => {
    try {
        const files = await fs.readdir(path.resolve(__dirname, "tmp"));
        files.forEach(async file => await fs.unlink(file));
    } catch(err) {
        console.log(`deleteTmpFiles - ${err}`);
        return { error: err };
    }
};

export default fileUplBadges;
import IFileManager from "../common/interfaces/managers/IFileManager.js";

import fs from "fs/promises"

import { uploadsFolder } from "../middlewares/uploadFile.js";



class BasicFileManager implements IFileManager {
    

    async deleteFile(email: string, fileName: string): Promise<void> {

        try {
            await fs.unlink(`${uploadsFolder}/${email}/${fileName}`);
            console.log(`${fileName} was deleted`);
        } catch (e) {
            console.error("Error deleting file: ", e);
            throw e;
        }
    }

}

export default new BasicFileManager();
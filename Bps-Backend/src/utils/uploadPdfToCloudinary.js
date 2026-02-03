import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (filePath, folder = "quotations") => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: "auto",   // 🔥 IMPORTANT
            type: "upload",
            access_mode: "public",
            use_filename: true,
            unique_filename: true
        });

        // ✅ SAFE DELETE
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return result;

    } catch (error) {

        // ✅ SAFE DELETE ON ERROR
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        throw error;
    }
};

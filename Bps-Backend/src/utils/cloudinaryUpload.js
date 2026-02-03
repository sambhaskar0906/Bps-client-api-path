import cloudinary from "../utils/cloudinary.js";

export const uploadPdfToCloudinary = async (buffer, fileName) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                folder: "bilty",
                public_id: fileName.replace(".pdf", "")
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        ).end(buffer);
    });
};

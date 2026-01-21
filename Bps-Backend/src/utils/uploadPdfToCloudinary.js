import cloudinary from "./cloudinary.js";

export const uploadPdfToCloudinary = async (filePath, bookingId) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "bharatparcel/quotations",
        resource_type: "raw",
        public_id: `quotation_${bookingId}`,
        overwrite: true,
    });

    return result.secure_url;
};

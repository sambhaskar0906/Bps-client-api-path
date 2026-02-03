import { upload } from "../middleware/multer.middleware.js";   // 👈 existing multer middleware
import { uploadToCloudinary } from "../utils/uploadPdfToCloudinary.js";

/**
 * Multer config for staff (using existing upload)
 */
export const staffMulter = upload.fields([
    { name: "aadharCardPhoto", maxCount: 1 },
    { name: "passportPhoto", maxCount: 1 }
]);

/**
 * Cloudinary middleware for staff
 */
export const staffCloudinary = async (req, res, next) => {
    try {
        req.staffDocs = {};

        if (!req.files) return next();

        // Aadhar
        if (req.files.aadharCardPhoto?.[0]) {
            const r = await uploadToCloudinary(
                req.files.aadharCardPhoto[0].path,
                "staff/aadhar"
            );

            req.staffDocs.aadharCardPhoto = {
                url: r.secure_url,
                public_id: r.public_id
            };
        }

        // Passport
        if (req.files.passportPhoto?.[0]) {
            const r = await uploadToCloudinary(
                req.files.passportPhoto[0].path,
                "staff/passport"
            );

            req.staffDocs.passportPhoto = {
                url: r.secure_url,
                public_id: r.public_id
            };
        }

        next();
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Staff cloud upload failed",
            error: error.message
        });
    }
};

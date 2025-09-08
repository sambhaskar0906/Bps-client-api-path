// utils/multerErrorHandler.js
export const multerErrorHandler = (err, req, res, next) => {
    if (err) {
      console.error("Multer Error:", err);  // Console the full multer error
      return res.status(400).json({ success: false, message: err.message || "File upload error." });
    }
    next();
  };
  
import multer from 'multer';
import path from 'path';

// Define file storage with destination and filename configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');  // Save files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Use a unique identifier or timestamp to avoid overwriting files with the same name
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}${fileExtension}`;
    cb(null, fileName);
  }
});

// Multer middleware
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, });

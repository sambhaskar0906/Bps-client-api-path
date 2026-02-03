import express from "express";
import { sendMessageController, sendBookingConfirmation, sendBookingWhatsappWithPdf, sendBookingWhatsappText } from "../controller/whatsappController.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { roleAccessFilter } from "../middleware/role.middleware.js";
import { biltyUpload } from "../middleware/biltyMulter.js";
import { sendBiltyOnWhatsApp } from "../controller/whatsappController.js";

const router = express.Router();

// Secure route
router.post("/send", verifyJwt, roleAccessFilter, sendMessageController);
router.post(
    "/booking-confirm",
    verifyJwt,
    roleAccessFilter,
    sendBookingConfirmation
);
router.post(
    "/send-bilty",
    verifyJwt,
    roleAccessFilter,
    biltyUpload.single("bilty"),
    sendBiltyOnWhatsApp
);
router.post(
    "/booking-text",
    verifyJwt,
    roleAccessFilter,
    sendBookingWhatsappText
);

router.post(
    "/booking-pdf",
    verifyJwt,
    roleAccessFilter,
    biltyUpload.single("bilty"),
    sendBookingWhatsappWithPdf
);


export default router;

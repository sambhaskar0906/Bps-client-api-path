import express from "express";
import multer from 'multer';
import {
    previewInvoices,
    generateInvoices,
    getAllInvoices,
    sendInvoiceByBookingId
} from "../controller/customerLedgerHistory.controller.js"

const router = express.Router();
const upload = multer();
router.post("/preview", previewInvoices);
router.post("/generate", generateInvoices);
router.get("/all", getAllInvoices);
router.post('/send-invoice', upload.single('file'), sendInvoiceByBookingId);

export default router;
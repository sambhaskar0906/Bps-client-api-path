import express from "express";
import {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  getTotalBookingRequests,
  getTotalActiveDeliveries,
  getTotalCancelled,
  getTotalRevenue,
  getActiveList,
  getCancelledList,
  getRevenue,
  searchQuotationByBookingId,
  RequestBookingList,
  updateQuotationStatus,
  sendBookingEmail,
  sendBookingEmailById,
  getBookingSummaryByDate,
  getIncomingQuotations,
  previewReceiptNo,
  sendQuotationWhatsapp

} from "../controller/customerQuotation.controller.js";
import { parseFormData } from "../middleware/multerParser.middleware.js";
import { verifyJwt } from '../middleware/auth.middleware.js'
const router = express.Router();

// Route to create a new quotation with form data (including files)
router.post("/", verifyJwt, createQuotation);

// Route to get all quotations
router.get("/", getAllQuotations);

// Route to get total booking requests
router.get("/total-booking-requests", verifyJwt, getTotalBookingRequests);

// Route to get total active deliveries
router.get("/total-active-deliveries", verifyJwt, getTotalActiveDeliveries);

// Route to get total cancelled quotations
router.get("/total-cancelled", verifyJwt, getTotalCancelled);

// Route to get total revenue
router.get("/total-revenue", verifyJwt, getTotalRevenue);

router.get("/active-list", verifyJwt, getActiveList);

router.get("/cancelled-list", verifyJwt, getCancelledList);

router.get("/revenue-list", verifyJwt, getRevenue)

router.get("/send-Booking-Email/:bookingId", sendBookingEmailById)

router.post("/send-whatsapp/:bookingId", verifyJwt, sendQuotationWhatsapp);

router.post("/booking-summary-date", verifyJwt, getBookingSummaryByDate)
router.get("/receipt/preview", verifyJwt, previewReceiptNo);

router.get("/booking-request-list", verifyJwt, RequestBookingList)

router.patch("/status/:bookingId", updateQuotationStatus);
// Route to get a single quotation by its ID
router.get("/:id", getQuotationById);

// Route to update a quotation
router.put("/:bookingId", updateQuotation);

// Route to delete a quotation
router.delete("/:bookingId", deleteQuotation);

router.get("/search/:bookingId", searchQuotationByBookingId);
// Route to incoming quotation
router.post("/qincoming", verifyJwt, getIncomingQuotations);
export default router;
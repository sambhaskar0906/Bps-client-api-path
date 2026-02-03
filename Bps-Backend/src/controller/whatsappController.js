import { sendWhatsAppMessage } from "../services/whatsappServices.js";
import Quotation from "../model/customerQuotation.model.js";
import Booking from "../model/booking.model.js";
import { bookingConfirmationTemplate, bookingConfirmationTemplateForBooking } from "../utils/whatsappTemplates.js";
import { uploadPdfToCloudinary } from "../utils/cloudinaryUpload.js";
import { sendWhatsAppDocument } from "../services/whatsappServices.js";

export const sendMessageController = async (req, res, next) => {
  try {
    const { to, message } = req.body;

    const result = await sendWhatsAppMessage({ to, message });

    res.status(200).json({
      success: true,
      message: "WhatsApp message sent",
      data: result
    });

  } catch (error) {
    next(error);
  }
};

/* 🔥 Booking Confirmation WhatsApp */
export const sendBookingConfirmation = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId required"
      });
    }

    // DB से quotation/booking data
    const booking = await Quotation.findOne({ bookingId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const phone = booking.mobile || booking.toContactNumber;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone not found"
      });
    }

    // 🧾 Template generate
    const message = bookingConfirmationTemplate(booking);

    // 📲 WhatsApp send
    const result = await sendWhatsAppMessage({
      to: `91${phone}`,   // country code ensure
      message
    });

    res.status(200).json({
      success: true,
      message: "Booking confirmation WhatsApp sent",
      data: result
    });

  } catch (error) {
    next(error);
  }
};

export const sendBiltyOnWhatsApp = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const file = req.file;

    if (!bookingId || !file) {
      return res.status(400).json({ message: "bookingId & bilty required" });
    }

    const booking = await Quotation.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const phone = booking.mobile || booking.toContactNumber;
    if (!phone) {
      return res.status(400).json({ message: "Phone not found" });
    }

    // ☁️ Upload PDF
    const pdfUrl = await uploadPdfToCloudinary(
      file.buffer,
      `Bilty_${bookingId}.pdf`
    );

    // 🧾 TEMPLATE TEXT
    const caption = bookingConfirmationTemplate(booking);

    // 📲 WhatsApp (DOCUMENT + TEMPLATE)
    await sendWhatsAppDocument({
      to: `91${phone}`,
      documentUrl: pdfUrl,
      filename: `Bilty_${bookingId}.pdf`,
      caption
    });

    res.json({
      success: true,
      message: "Bilty + booking details sent on WhatsApp"
    });

  } catch (error) {
    next(error);
  }
};

export const sendBookingWhatsappWithPdf = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const file = req.file;

    if (!bookingId || !file) {
      return res
        .status(400)
        .json({ message: "bookingId & pdf required" });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const phone = booking.mobile || booking.receiverContact;
    if (!phone) {
      return res.status(400).json({ message: "Phone not found" });
    }

    // ☁️ Upload PDF
    const pdfUrl = await uploadPdfToCloudinary(
      file.buffer,
      `Booking_${bookingId}.pdf`
    );

    // 🔥 Save PDF in model
    booking.quotationPdf = pdfUrl;
    await booking.save();

    // 🧾 Same template
    const caption =
      bookingConfirmationTemplateForBooking(booking);

    await sendWhatsAppDocument({
      to: `91${phone}`,
      documentUrl: pdfUrl,
      filename: `Booking_${bookingId}.pdf`,
      caption
    });

    res.json({
      success: true,
      message: "Booking PDF + WhatsApp message sent"
    });
  } catch (err) {
    next(err);
  }
};

export const sendBookingWhatsappText = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId required" });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const phone = booking.mobile || booking.receiverContact;
    if (!phone) {
      return res.status(400).json({ message: "Phone not found" });
    }

    const message =
      bookingConfirmationTemplateForBooking(booking);

    await sendWhatsAppMessage({
      to: `91${phone}`,
      message
    });

    res.json({
      success: true,
      message: "Booking WhatsApp text sent"
    });
  } catch (err) {
    next(err);
  }
};

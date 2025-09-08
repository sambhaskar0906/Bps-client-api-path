// models/Invoice.js
import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: { type: String, required: true, unique: true }, // BPS/MUM/0001
        stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
        stationCode: { type: String, required: true },                 // "MUM"
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        fromDate: { type: Date, required: true },
        toDate: { type: Date, required: true },
        bookingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
        totals: {
            subtotal: { type: Number, default: 0 },
            tax: { type: Number, default: 0 },
            grandTotal: { type: Number, default: 0 },
        },
        pdfPath: { type: String },          // optional if you store the PDF
        createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", InvoiceSchema);
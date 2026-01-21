import ReceiptCounter from "../model/receiptCounter.model.js";

/* ===========================
   🔹 BOOKING RECEIPT
   Format: BPS-AGR-001
=========================== */

export const previewNextBookingReceiptNo = async (stationCode) => {
    const counter = await ReceiptCounter.findOne({
        stationCode,
        type: "BOOKING",
    });
    const nextNumber = counter ? counter.lastNumber + 1 : 1;
    return `BPS-${stationCode}-${String(nextNumber).padStart(3, "0")}`;
};


// 🔹 FINAL (save ke time – increment karega)
export const generateAndCommitBookingReceiptNo = async (stationCode) => {
    const counter = await ReceiptCounter.findOneAndUpdate(
        { stationCode, type: "BOOKING" },
        { $inc: { lastNumber: 1 } },
        { new: true, upsert: true }
    );

    return `BPS-${stationCode}-${String(counter.lastNumber).padStart(3, "0")}`;
};


// 🔹 PREVIEW (frontend ke liye – increment nahi karega)
export const previewNextReceiptNo = async (stationCode) => {
    const counter = await ReceiptCounter.findOne({
        stationCode,
        type: "QUOTATION",
    });

    const nextNumber = counter ? counter.lastNumber + 1 : 1;

    return `BPS-Q-${stationCode}-${String(nextNumber).padStart(3, "0")}`;
};


// 🔹 FINAL (save ke time – increment karega)
export const generateAndCommitReceiptNo = async (stationCode) => {
    const counter = await ReceiptCounter.findOneAndUpdate(
        { stationCode, type: "QUOTATION" },
        { $inc: { lastNumber: 1 } },
        { new: true, upsert: true }
    );

    return `BPS-Q-${stationCode}-${String(counter.lastNumber).padStart(3, "0")}`;
};


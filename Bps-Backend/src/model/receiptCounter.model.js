import mongoose from "mongoose";

const receiptCounterSchema = new mongoose.Schema({
    stationCode: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["BOOKING", "QUOTATION"],
    },
    lastNumber: {
        type: Number,
        default: 0,
    },
});

const ReceiptCounter =
    mongoose.models.ReceiptCounter ||
    mongoose.model("ReceiptCounter", receiptCounterSchema);

export default ReceiptCounter;

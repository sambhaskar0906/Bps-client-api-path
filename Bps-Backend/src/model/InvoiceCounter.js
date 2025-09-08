import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema({
    stationCode: { type: String, required: true, unique: true },
    counter: { type: Number, default: 0 }
});

export default mongoose.model("InvoiceCounter", invoiceCounterSchema);
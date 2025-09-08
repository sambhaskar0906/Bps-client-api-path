
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    invoiceNo: { type: String, required: true, unique: true },
    details: { type: String, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    document: { type: String,required:true },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

export { Expense };

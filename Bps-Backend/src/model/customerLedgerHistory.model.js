import mongoose from "mongoose";

const ledgerHistorySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  bookingId: String,
  amount: Number,
  paidAmount: Number,
  remainingAmount: Number,
 additionalStatement:
 {
  type:String
 },
 createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
       },
},{timestamps:true});

const CustomerLedgerHistory = mongoose.model("CustomerLedgerHistory", ledgerHistorySchema);
export default CustomerLedgerHistory;

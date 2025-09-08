

import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({
  orderType: {
    type: String,
    enum: ["Booking", "Quotation"],
    required: true,
  },
  orderRef: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "orderTypeRef", 
  },
  orderTypeRef: {
    type: String,
    required: true,
    enum: ["Booking", "CustomerQuotation"], 
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true 
});

export default mongoose.model("Tracking", trackingSchema);

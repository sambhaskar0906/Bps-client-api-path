

import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null
  },

  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quotation",
    default: null
  },
  deliveryType: { type: String, enum: ["Booking", "Quotation"], required: true },

  driverId: {
    type: String,
    required: true,
  },
  vehicleModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Final Delivery"],
    default: "Pending",
  },
  fromName: String,
  pickup: String,
  toName: String,
  drop: String,
  contact: String,
}, {
  timestamps: true,
});


const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;
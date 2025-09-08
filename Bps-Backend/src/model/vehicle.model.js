import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
  registrationDate: {
    type: Date,
    required: true
  },
  regExpiryDate: {
    type: Date,
    required: true
  },
  vehicleModel: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  manufactureYear: {
    type: Number,
    required: true
  },
  ownedBy: {
    type: String,
    required: true
  },
  currentLocation: {
    type: String,
    required: true
  },
  dateofPurchase: {
    type: Date,
    required: true
  },
  purchasedFrom: {
    type: String,
    required: true
  },
  PurchasedUnder: {
    type: String,
    required: true 
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  depreciation: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true,
    min: 0
  },
  currentInsuranceProvider: {
    type: String,
    required: true
  },
  policyNumber: {
    type: String,
    required: true
  },
  policyType: {
    type: String,
    required: true 
  },
  policyStartDate: {
    type: Date,
    required: true
  },
  policyEndDate: {
    type: Date,
    required: true
  },
  policyPremium: {
    type: Number,
    required: true
  },
  lastFitnessRenewalDate: {
    type: Date,
    required: true
  },
  currentFitnessValidUpto: {
    type: Date,
    required: true
  },
  firstRegValidUpto: {
    type: Date,
    required: true
  },
  renewalDate: {
    type: Date,
    required: true
  },
  renewalValidUpto: {
    type: Date,
    required: true
  },
  addcomment: {
    type: String
  },
  vehicleId: {
    type: String,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {timestamps: true });

VehicleSchema.pre("save", async function (next) {
  if (!this.vehicleId) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    this.vehicleId = `BHPAR${randomDigits}VEG`;
  }
  next();
});
export const Vehicle = mongoose.model("Vehicle", VehicleSchema);

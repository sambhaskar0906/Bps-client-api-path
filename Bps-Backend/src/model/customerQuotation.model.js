import mongoose from "mongoose";
const quotationSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "QCustomer", // Fixed reference name
  },
  startStation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "manageStation",
  },
  startStationName: {
    type: String,
    required: true,
  },
  endStation: {
    type: String,
    required: true
  },

  firstName: String,
  middleName: String,
  lastName: String,
  mobile: String,
  email: String,
  locality: String,

  quotationDate: {
    type: Date,
    required: true
  },
  proposedDeliveryDate: {
    type: Date,
    required: true
  },

  fromCustomerName: {
    type: String,
    required: true
  },
  fromAddress: {
    type: String,
    required: true
  },
  fromCity: {
    type: String,
    required: true
  },
  fromState: {
    type: String,
    required: true
  },
  fromPincode: {
    type: String,
    required: true
  },

  toCustomerName: {
    type: String,
    required: true
  },
  toContactNumber: {
    type: String,
  },
  toAddress: {
    type: String,
    required: true
  },
  toCity: {
    type: String,
    required: true
  },
  toState: {
    type: String,
    required: true
  },
  toPincode: {
    type: String,
    required: true
  },

  additionalCmt: String,
  sTax: {
    type: Number,
    default: 0
  },
  sgst: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
  },
  amount: {
    type: Number,
    default: 0,
  },
  freight: {
    type: Number,
    default: 0
  },
  productDetails: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      insurance: {
        type: Number,
      },
      vppAmount: {
        type: Number,
      },
      price: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        required: true
      },
      topay: {
        type: String,
        required: true,
        enum: ["paid", "toPay", "none"],
      },
      receiptNo: {
        type: String,
        default: ""
      },
      refNo: {
        type: String,
        default: ""
      }
    },
  ],

  activeDelivery: {
    type: Boolean,
    default: false
  },
  totalCancelled: {
    type: Number,
    default: 0
  },
  invoiceGenerated: {
    type: Boolean,
    default: false,
  },
  createdByRole: {
    type: String,
    enum: ['admin', 'supervisor'],
  },
  createdByUser: {
    type: String,
  },
  orderId: {
    type: String,
    default: null
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for product total
quotationSchema.virtual("productTotal").get(function () {
  return this.productDetails.reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

// Virtual for total quantity
quotationSchema.virtual("bookingRequestTotal").get(function () {
  return this.productDetails.reduce((acc, item) => acc + item.quantity, 0);
});

// Virtual for total tax
quotationSchema.virtual("totalTax").get(function () {
  const productTotal = this.productTotal;
  const sTaxAmount = (productTotal * this.sTax) / 100;
  const sgstAmount = (productTotal * this.sgst) / 100;
  return sTaxAmount + sgstAmount;
});

// Virtual for computed total revenue
quotationSchema.virtual("computedTotalRevenue").get(function () {
  const productTotal = this.productTotal;
  const totalTax = this.totalTax;
  return productTotal + totalTax + this.freight + this.amount;
});

quotationSchema.pre("save", async function (next) {
  // Generate booking ID if not set
  if (!this.bookingId) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BHPAR${randomNumber}QUOK`;
  }

  // Calculate grandTotal if not set
  if (!this.grandTotal) {
    this.grandTotal = this.computedTotalRevenue;
  }

  next();
});

const Quotation = mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);
export default Quotation;